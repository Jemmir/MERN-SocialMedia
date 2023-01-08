import { Router } from "express";
import { Post } from "../models/Post.js";
import { User } from "../models/user.js";

const router = Router();

//create a post 
router.post("/", async(req,res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save()
        return res.status(200).json(savedPost)
    } catch (error) {
        console.log(error)
    }
})

//update post 

router.put("/:id", async(req, res) => {
    const post = await Post.findById(req.params.id)
    try {
        if(post.userId === req.body.userId){
            const updated = await post.updateOne({$set: req.body})
            return res.status(200).json("Updated successfully")
        }else throw new Error("This is not your post")
    } catch (error) {
        console.log(error)
        error.message === "This is not your post" && res.status(403).json(error.message)
    }
    
})

//delete post

router.delete("/:id", async(req, res) => {
    console.log(req.params.id)
    console.log(req.body)
    
    const post = await Post.findById(req.params.id)
    try {
        if(post.userId === req.body.userId){
            await post.deleteOne()
            return res.status(200).json("Post deleted")
        }else throw new Error("This is not your post")
    } catch (error) {
        console.log(error)
        error.message === "This is not your post" && res.status(403).json(error.message)
    }
    
})

//like a post

router.put("/:id/like", async(req,res) => {
    const post = await Post.findById(req.params.id)
    try {
        if(!post.likes.includes(req.body.userId)){
            post.likes.push(req.body.userId)
            post.likesNumber += 1
            await post.save()
            res.status(200).json("Liked")
        }else if(post.likes.includes(req.body.userId)){
            const nuevo = post.likes.filter((i) => i !== req.body.userId)
            post.likes = nuevo
            post.likesNumber -= 1
            await post.save()
            res.status(200).json("You took out your like")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

//get a post 

router.get("/:id", async(req,res) => {
    const post = await Post.findById(req.params.id)
    try {
        return res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
})

//get timeline post
router.get("/timeline/:userId", async (req, res) => {
    try {
      const currentUser = await User.findById(req.params.userId);
      const userPosts = await Post.find({ userId: currentUser._id });
      const friendPosts = await Promise.all(
        currentUser.following.map((friendId) => {
          return Post.find({ userId: friendId });
        })
      );
      res.status(200).json(userPosts.concat(...friendPosts).sort((a,b) => b.createdAt - a.createdAt));
    
    // const user = await User.findOne({follower:req.params.userId})
    // const posts = await Post.find({userId: user._id})
    // const myposts = await Post.find({userId: req.params.userId})
   
    // res.json(posts.concat(...myposts).sort((a,b) => a.createdAt - b.createdAt))
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
//get user's all posts

router.get("/profile/:username", async (req, res) => {
    try {
      
      const posts = await Post.find({username: req.params.username});
      res.status(200).json(posts.sort((a,b) => b.createdAt - a.createdAt));
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
//get user's liked posts

router.get("/profile/:id/liked", async (req, res) => {
    try {
      
      const posts = await Post.find({likes: {$all: [req.params.id]}});
      res.status(200).json(posts.sort((a,b) => b.createdAt - a.createdAt));
    } catch (err) {
      res.status(500).json(err);
    }
  });

//get the most liked post

router.get("/mostliked/:userId", async(req,res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
          currentUser.following.map((friendId) => {
            return Post.find({ userId: friendId }).sort({"likesNumber":-1, "createdAt": -1}).limit(1)
          })
        );
        res.status(200).json(friendPosts.filter(i => i.length > 0));
      
      // const user = await User.findOne({follower:req.params.userId})
      // const posts = await Post.find({userId: user._id})
      // const myposts = await Post.find({userId: req.params.userId})
     
      // res.json(posts.concat(...myposts).sort((a,b) => a.createdAt - b.createdAt))
      } catch (err) {
        res.status(500).json(err);
      }
})
export default router