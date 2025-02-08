declare global{
  namespace Express{
    export interface Request {
      userId?: string;
    }
  }

}





import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel, LinkModel } from "./db";
import { userMiddleware } from "./middleware";
import { JWT_PASSWORD } from "./config";
import { random } from "./utils";
import cors from "cors"


const app = express();
app.use(express.json());
app.use(cors());

//Signup Endpoint
app.post("/api/v1/signup", async (req, res) => {
  //zod validation
  const username = req.body.username;
  const password = req.body.password;

  //import UserModel from db.ts and use to add data to backend

  try {
    await UserModel.create({
      username,
      password,
    });
    res.json({
      message: "User Signed Up",
    });
  } catch (e) {
    //By inspecting e more reasons/errors for crash could be found which can be handled here making the backend more expressive
    res.status(411).send({
      message: "User Already Exist",
    });
  }
});

app.post("/api/v1/signin",async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username: username,
    password: password
  })

  if(existingUser){
    const token = jwt.sign({
        id:existingUser._id

    },JWT_PASSWORD)

    res.json({
        token
    })
  }
  else{
    res.status(403).send({
        message: "Incorrect Credentials "
    })
  }

  
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const title = req.body.title;
    const type = req.body.type;
    const link = req.body.link;
    
    const userId = req.userId;

    await ContentModel.create({
        title,
        type,
        link,
        userId,
        tags:[]
    })

    res.json({
        message: "Content Added"
    })



});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })

});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
       
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
    
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share;

  if(share){

    const existingLink = await LinkModel.findOne({
      userId: req.userId
    })

    if(existingLink){
      res.json({
        hash: existingLink.hash
      })
      return;
    }
 
    const hash = random(10);
    await LinkModel.create({
      userId: req.userId,
      hash: hash
    })

    res.json({
      hash
    })

  }else{
    await LinkModel.deleteOne({
      userId: req.userId
    })

    res.json({
      message: "Removed Link"
    })


  }


});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash
  })

  if(!link){
    res.status(411).json({
      message: "Brain does't exist"
    })
    return; 
  }

  const content = await ContentModel.findOne({
    userId: link.userId
  })

  const user = await UserModel.findOne({
    _id: link.userId
  })

  if(!user){ //If user not found ..  Ideally it should not happent becoz if link is found then user already exist
    res.status(411).json({
      message: "User not found"
    })
    return;
  }

  res.json({
    username: user.username,
    content: content
  })




});

const Port = 3000;
app.listen(Port, () => {
  console.log(`Port running on ${Port}`);
});
