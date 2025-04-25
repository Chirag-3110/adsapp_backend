const JWT_SECRET = 'NodeApp'
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

export function generateJWT(body:any) {
  const secretKey = JWT_SECRET ;
  return jwt.sign(
    body,
    secretKey
  );
}

export const generateOTP = async (length=6) => {
  const otp = otpGenerator.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });
  return otp;
};

export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};