import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        max:500
    },
    img:{
        type:String,
        
    },
    video:{
        type:String
    },
    likes:{
        type:Array,
        default:[]
    },
    likesNumber:{
        type:Number,
        default:0
    },
    username:{
        type:String,
        required: true
    }
   
},{timestamps:true})

export const Post = mongoose.model("Post", PostSchema)