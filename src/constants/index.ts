
const constants = {
  success: {
    loginSuccess:'Login success',
    updateSuccess:'Profile updated successfully',
    accountDeleted:"Account deleted successfully",
    accountCreated:"Account created successfully",
    earningRecordAdded: "Earning record added successfully",
    earningList: "User earnings fetched successfully",
    pointsRedemed:"Points redeemed successfully"
  },
  errors: {
    emailPassReq: 'Email and password required',
    invalidCredentials: "Invalid email or password.",
    invalidPassword: "Invalid password.",
    internalServerError: "Something went wrong. Please try again later.",
    userNotFound:"User not found",
    emailExisted:"Email already registered",
    missingFields:"points and adsid required",
    invalidRequest:"Name, email, password, phone and profile image are required",
    dataIsReq:"pointsRedeemed and amountRedeemed are required",
    walletNotFound:"Wallet not found for this user",
    insufficiendFunds:"Insufficient points in wallet",
  },
};

export {
  constants
}