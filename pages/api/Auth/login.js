import DBconnection from "@/utils/DBConnection";
import User from "@/model/User";
import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});



export default async (req, res) => {

    await DBconnection();

    const { email, password } = req.body;

    const { error } = schema.validate({ email, password });

    if (error) {

        return res.status(401).json({ success: false, message: error.details[0].message.replace(/['"]+/g, '') })

    }

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Account not Found , PLease Sign Up" })
        }

        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({ success: false, message: "Something went wrong" })
                }
                if (result) {
                    const token = jwt.sign({ email: user.email, id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
                    return res.status(200).json({ success: true, message: "Login Successfull", token })
                }
                else {
                    return res.status(401).json({ success: false, message: "Password is Incorrect" })
                }
            })
        }
    }
    catch (error) {

        console.log("Error in login_user (server) => ", error);

        return res.status(500).json({ success: false, message: "Something went wrong" })

    }
}