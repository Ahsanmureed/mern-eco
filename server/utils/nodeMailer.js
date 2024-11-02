import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
      user: 'ach162753@gmail.com', 
      pass: 'sdrc zgjr krmz aght', 
  },
});
export default transporter