import db from "../models/index";
require('dotenv').config();

let createNewClinicService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.name
                || !data.address 
                || !data.imageBase64 
                || !data.descriptionHTML 
                || !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Parameters"
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

                resolve({
                    errCode: 0,
                    errMessage: "OK"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllClinicService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll();
            if(data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                message: "OK",
                data
            })
        } catch (e) {
            reject(e)
        }
    })  
}

let getDetailClinicByIdService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Parameters"
                })
            } else {
                let data = await db.Clinic.findOne({
                    where: {id: inputId},
                    attributes: ['descriptionHTML', 'descriptionMarkdown']
                })
                if(data) {
                    let doctorClinic = {};
                        doctorClinic = await db.Doctor_Info.findAll({
                            where: {clinicId: inputId},
                            attributes: ['doctorId', 'provinceId']
                        })

                    data.doctorClinic = doctorClinic

                } else {
                    data = {};
                }

                resolve({
                    errCode: 0,
                    errMessage: "OK",
                    data: data
                })

            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createNewClinicService,
    getAllClinicService,
    getDetailClinicByIdService
}