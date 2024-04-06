import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { addExperience, addQualification, createUser, getUserProfile, getUsers, login, logout, removeExperience, removeQualification, resetPassword, updateExperience, updateProfile, updateQualification } from './controller.js';
import { userCreateValidate } from './middlewares/userCreateValidate.js';
import { jwtAuth } from './middlewares/jwtAuth.js';

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true,
}))
app.use(cookieParser())

export default app;

//register user
app.post("/signup", userCreateValidate, createUser);

//login and logout user
app.post("/login", login);
app.post("/logout", logout);
app.post("/reset-password", resetPassword);

//user apis
app.get("/",jwtAuth,getUsers);
app.get("/users/:id", jwtAuth, getUserProfile);
app.put("/update-profile", jwtAuth, updateProfile);

app.post("/user-experience", jwtAuth, addExperience);
app.put("/user-experience/:id", jwtAuth, updateExperience);
app.delete("/user-experience/:id", jwtAuth, removeExperience);

app.post("/user-qualification", jwtAuth, addQualification);
app.put("/user-qualification/:id", jwtAuth, updateQualification);
app.delete("/user-qualification/:id", jwtAuth, removeQualification);