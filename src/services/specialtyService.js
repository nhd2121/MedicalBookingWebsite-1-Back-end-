import db from "../models/index";
require('dotenv').config();

let createNewSpecialtyService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.name 
                || !data.imageBase64 
                || !data.descriptionHTML 
                || !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Parameters"
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
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

let getAllSpecialtyService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll();
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

let getDetailSpecialtyByIdService = (inputId, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!inputId || !location) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Parameters"
                })
            } else {
                let data = await db.Specialty.findOne({
                    where: {id: inputId},
                    attributes: ['descriptionHTML', 'descriptionMarkdown']
                })
                if(data) {
                    let doctorSpecialty = {};
                    if(location === "ALL") {
                        doctorSpecialty = await db.Doctor_Info.findAll({
                            where: {specialtyId: inputId},
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        // find by location
                        doctorSpecialty = await db.Doctor_Info.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }

                    data.doctorSpecialty = doctorSpecialty

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
    createNewSpecialtyService,
    getAllSpecialtyService,
    getDetailSpecialtyByIdService
}