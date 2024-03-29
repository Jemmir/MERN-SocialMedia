import { Router } from "express";
import { User } from "../models/user.js";
import bcrypt from "bcrypt"
const router = Router();

//register

router.post("/register", async(req,res) => {
    const {password, email, username, name, from} = req.body
    try {
        
        if(password.trim().length < 6) throw new Error("Password too short. Min 6 Characters")
        if(password.trim().length >= 6){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt)
            const newUser = new User({
                password: hashedPassword,
                email,
                username,
                name,
                from
            })
            await newUser.save()
            return res.status(200).send(newUser)
        }
       
    } catch (error) {
        console.log(error)
        if(error.code === 11000 && error.keyPattern.username === 1){
            return res.status(400).json("Error. The username already exists.")
        }else if(error.code === 11000 && error.keyPattern.email === 1){
            return res.status(400).json("Error. This email already exists")
        }else if(error.message === "Password too short. Min 6 Characters"){
            return res.status(400).json(error.message)
        }
    }
    
})

//login

router.post("/login", async(req,res) => {
    const {username, password} = req.body
    console.log(password)
    try {
        const user = await User.findOne({username})
        
        if(!user) throw new Error("This user doesn't exists")
        else if(user){
            const validPassword = await bcrypt.compare(password, user.password)
            if(validPassword && password){
                const {password, isAdmin, ...other} = user._doc
                return res.status(200).send(other)
            }else if(!validPassword){
                throw new Error("Wrong password")
            }
            
        }
    } catch (error) {
        if(error.message === "This user doesn't exists"){
            res.status(404).json(error.message)
        }else if(error.message === "Wrong password"){
            res.status(400).json(error.message)
        }
    }
    
})
export default router