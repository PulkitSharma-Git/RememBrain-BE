import mongoose, { model, Schema, connect, mongo } from "mongoose";


mongoose.connect("mongodb+srv://pulkit:Pulkit%40124@cluster0.0ne5n.mongodb.net/SecondBrain")


const userSchema = new Schema({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
});

const ContentSchema = new Schema({
  link: String,
  title: String,
  type: String,
  tags: [{type: mongoose.Types.ObjectId, ref: "Tag"}],
  userId: {type: mongoose.Types.ObjectId, ref: "User", required: true}

})

const LinkSchema = new Schema({
  hash: String,
  userId: {type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true}

})



export const UserModel = model("User", userSchema); 
export const ContentModel = model("Content", ContentSchema);
export const LinkModel = model("Links", LinkSchema)
