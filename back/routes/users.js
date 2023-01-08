import { Router } from "express";
import bcrypt from "bcrypt"
import { User } from "../models/user.js";

const router = Router();

//updateuser
router.put("/:id", async(req,res) => {
    try {
        if(req.body.userId === req.params.id || req.body.isAdmin){
            if(req.body.password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            const user = await User.findByIdAndUpdate(req.body.userId, {$set: req.body})
            return res.status(200).json("User has been updated successfully")
        }else throw new Error("You can't update a different user than yours")

    } catch (error) {
        if(error.message === "You can't update a different user than yours"){
            res.status(403).json(error.message)
        }
    }
   
})

//delete user
router.delete("/:id", async(req,res) => {
    try {
        if(req.body.userId === req.params.id || req.body.isAdmin){
            const user = await User.findByIdAndDelete(req.body.userId)
            return res.status(200).json("User has been deleted successfully")
        }else throw new Error("You can't delete a different user than yours")

    } catch (error) {
        if(error.message === "You can't delete a different user than yours"){
            res.status(403).json(error.message)
        }
    }
   
})

//get a user

router.get("/", async(req,res) => {
    
    try {
        if(req.query.username !== undefined && req.query.nofull !== undefined){
        const user = await User.findOne({username: req.query.username})
        
        if(user){
            const {password, updatedAt, isAdmin, email, followers, following, coverPicture,from ,createdAt,__v, ...other} = user._doc
            return res.status(200).send(other)
        }else if(!user){
            throw new Error("User not found")
        }
        }
        else if(req.query.username !== undefined && req.query.full !== undefined){
        const user = await User.findOne({username: req.query.username})
        
        if(user){
            const {password, updatedAt, isAdmin, ...other} = user._doc
            return res.status(200).send(other)
        }else if(!user){
            throw new Error("User not found")
        }
        }
        
    } catch (error) {
        console.log(error)
        if(error.message === "User not found"){
            return res.status(500).json({message: error.message})
        }
    }
   
})

//follow a user

router.put("/:id/follow", async(req,res) => {
    try {
        if(req.body.userId !== req.params.id){
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
         
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers: req.body.userId}})
                await currentUser.updateOne({$push:{following: req.params.id}})
                return res.status(200).json("User is now been followed")
            }else{
                throw new Error("Already in follow")
            }
        }else {
            throw new Error("You can't follow yourself")
        }
    } catch (error) {
        console.log(error)
        error.message === "You can't follow yourself" && res.status(403).json(error.message)
        error.message === "Already in follow" && res.status(403).json(error.message)

    }
})

router.put("/:id/unfollow", async(req,res) => {
    try {
        if(req.body.userId !== req.params.id){
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
         
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers: req.body.userId}})
                await currentUser.updateOne({$pull:{following: req.params.id}})
                return res.status(200).json("User is now been unfollowed")
            }else{
                throw new Error("This user is not being follow by you")
            }
        }else {
            throw new Error("You can't unfollow yourself")
        }
    } catch (error) {
        console.log(error)
        error.message === "You can't unfollow yourself" && res.status(403).json(error.message)
        error.message === "This user is not being follow by you" && res.status(403).json(error.message)

    }
})

export default router