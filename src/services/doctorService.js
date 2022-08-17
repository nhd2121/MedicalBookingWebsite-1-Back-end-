import db from "../models/index";
require('dotenv').config();
import _ from 'lodash';
import emailService from "../services/emailService";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getPopularDoctorHomeService = async (limitInput) => {
    return new Promise( async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ["password"],
                },
                include: [
                    {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                    {model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']},
                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users,
            })
            console.log(data);
        } catch (e) {
            reject(e);
        }
    })
}

let getAllDoctors = async () => {
    return new Promise( async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: {roleId: 'R2'},
                attributes: {
                    exclude: ["password", "image"],
                }
            })
            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}

let checkRequiredFields = (inputData) => {
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice',
                        'selectedPayment', 'selectedProvince', 'clinicName', 'clinicAddress',
                        'note', 'specialtyId'
                    ]
    let isValid = true;
    let element = '';
    for(let i = 0; i < arrFields.length; i++) {
        if(!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }

    return {
        isValid: isValid,
        element: element
    }
}

let saveInfoDoctors = async (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFields(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters: ${checkObj.element}`
                })
            } else {
                //upsert to Markdown table
                if(inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId
                    })
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: {doctorId: inputData.doctorId},
                        raw: false,
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML= inputData.contentHTML;
                        doctorMarkdown.contentMarkdown= inputData.contentMarkdown;
                        doctorMarkdown.description= inputData.description;
                        doctorMarkdown.updateAt = new Date();

                        await doctorMarkdown.save();
                    }
                }

                //Upsert to doctor_info table
                let doctorInfo = await db.Doctor_Info.findOne({
                    where: {doctorId: inputData.doctorId},
                    raw: false,
                })
                if(doctorInfo) {
                    //  update/edit
                    doctorInfo.doctorId = inputData.doctorId;
                    doctorInfo.priceId = inputData.selectedPrice;
                    doctorInfo.paymentId = inputData.selectedPayment;
                    doctorInfo.provinceId = inputData.selectedProvince;
                    doctorInfo.nameClinic = inputData.clinicName;
                    doctorInfo.addressClinic = inputData.clinicAddress;
                    doctorInfo.note = inputData.note;
                    doctorInfo.specialtyId = inputData.specialtyId;
                    doctorInfo.clinicId = inputData.clinicId;

                    await doctorInfo.save();
                } else {
                    //  create
                    await db.Doctor_Info.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        provinceId: inputData.selectedProvince,
                        nameClinic: inputData.clinicName,
                        addressClinic: inputData.clinicAddress,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId
                    })
                }
            }

            resolve({
                errCode: 0,
                message: "Save doctor info successfully"
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailDoctorByIdService = (doctorId) => {
    return new Promise( async (resolve, reject) => {
        try {
            if(!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters !"
                })
            } else {
                let data = await db.User.findOne({
                    where: {id: doctorId},
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        {
                            model: db.Allcode, 
                            as: 'positionData', 
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Doctor_Info,
                            attributes: {
                                exclude: ["id", "doctorId"],
                            },
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                            ],
                        },
                    ],
                    raw: false,
                    nest: true
                })
                if(data && data.image) {
                    data.image = new Buffer(data.image, "base64").toString("binary");
                }

                if(!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let bulkCreateScheduleService = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            if(!data.arrSchedule || !data.doctorId || !data.Formateddate) {
                resolve({
                    errCode: 1,
                    errMessage: "missing required param !"
                })
            } else {
                let schedule = data.arrSchedule;
                
                if(schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }
                
                let existingDb = await db.Schedule.findAll({
                    where: {doctorId: data.doctorId, date: "" + data.Formateddate},
                    attributes: ["timeType", "date", "doctorId", "maxNumber"],
                    raw: true
                });

                //compare
                let toCreate = _.differenceWith(schedule, existingDb, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                // add the new data to db ignore the existing
                if(toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
                resolve({
                    errCode: 0,
                    errMessage: "OK"
                })
            }
            resolve('');
        } catch (e) {
            reject(e);
        }
    })
}

let getScheduleDoctorByDateService = (doctorId, date) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!doctorId || !date) {
                resolve ({
                    errCode: 1,
                    errMessage: "Missing required parameters"
                })
            } else {
                let data = await db.Schedule.findAll({
                    where : {
                        doctorId: doctorId,
                        date: date
                    }, 
                    include: [
                        {
                            model: db.Allcode, 
                            as: 'timeTypeData', 
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.User, 
                            as: 'doctorData', 
                            attributes: ['firstName', 'lastName']
                        }
                    ],
                    raw: false,
                    nest: true
                })

                if(!data) data = [];

                resolve ({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getExtraInfoDoctorByIdService = (idInput) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!idInput) {
                resolve ({
                    errCode: 1,
                    errMessage: "Missing required parameters"
                }) 
            } else {
                let data = await db.Doctor_Info.findOne({
                    where: {doctorId: idInput},
                    attributes: {
                        exclude: ["id", "doctorId"],
                    },
                    include: [
                        {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                    ],
                    raw: false,
                    nest: true
                })

                if(!data) data = {};

                resolve ({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getProfileDoctorByIdService = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!inputId) {
                resolve ({
                    errCode: 1,
                    errMessage: "Missing required parameters"
                }) 
            } else {
                let data = await db.User.findOne({
                    where: {id: inputId},
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        {
                            model: db.Allcode, 
                            as: 'positionData', 
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Doctor_Info,
                            attributes: {
                                exclude: ["id", "doctorId"],
                            },
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                            ],
                        },
                    ],
                    raw: false,
                    nest: true
                })
                if(data && data.image) {
                    data.image = new Buffer(data.image, "base64").toString("binary");
                }

                if(!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getListPatientForDoctorService = (doctorId, date) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameters"
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'address', 'gender', 'firstName'],
                            include: [
                                {model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']},
                            ]
                        },
                        {
                            model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi'],
                        }
                    ],
                    raw: false,
                    nest: true
                })

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let sendBillService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!data.doctorId || !data.email ||!data.patientId ||!data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameters"
                })
            } else {
                //update patient status
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false
                })

                if(appointment) {
                    appointment.statusId = 'S3';
                    await appointment.save()
                }

                //send bill
                await emailService.sendAttachment(data);

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getPopularDoctorHomeService,
    getAllDoctors,
    saveInfoDoctors,
    getDetailDoctorByIdService,
    bulkCreateScheduleService,
    getScheduleDoctorByDateService,
    getExtraInfoDoctorByIdService,
    getProfileDoctorByIdService,
    getListPatientForDoctorService,
    sendBillService
}