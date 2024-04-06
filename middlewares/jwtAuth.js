import jwt from 'jsonwebtoken';

export const jwtAuth = (req, res, next) => {
  const { jwtToken } = req.cookies;
  console.log(jwtToken);

  try{
    jwt.verify(jwtToken, "0KILIFer2LvZj0xexnnsiQeZekoXMJ6j")
    next();
  }catch(err){
    return res.status(400).send("Please login to access the content");
  }
}