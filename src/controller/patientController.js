import patientService from "../services/patientService";

let bookPatientAppointment = async (req, res) => {
    try {
        let info = await patientService.bookPatientAppointmentService(req.body);
        return res.status(200).json(info);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: "Error from server...",
        })
    }
}

let verifyPatientAppointment = async (req, res) => {
    try {
        let info = await patientService.verifyPatientAppointmentService(req.body);
        return res.status(200).json(info);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: "Error from server...",
        })
    }
}

module.exports = {
    bookPatientAppointment,
    verifyPatientAppointment
}