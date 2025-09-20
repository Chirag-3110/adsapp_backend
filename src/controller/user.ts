import { constants } from "../constants";
import { generateJWT } from "../utils";
import { buildErrorResponse, buildObjectResponse } from "../utils/responseUtils";
import db from '../database/sqlConnect';
import bcrypt from 'bcrypt';

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return buildErrorResponse(res, constants.errors.emailPassReq, 400);
    }

    const [rows] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
    const users = rows as any[];

    if (users.length === 0) {
      return buildErrorResponse(res, constants.errors.invalidCredentials, 401);
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return buildErrorResponse(res, constants.errors.invalidPassword, 401);
    }

    const token = generateJWT({ id: user.id, email: user.email });

    return buildObjectResponse(res, {
      message: constants.success.loginSuccess,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        profileImage: user.profileImage,
        phone: user.phone,
        accountDetailsId: user.accountDetailsId,
        dob: user.dob,
        createdAt: user.createdAt,
      },
    });

  } catch (error: any) {
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};

export const getUserDetails = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    

    const [rows] = await db.query("SELECT * FROM User WHERE id = ?", [userId]);
    const users = rows as any[];

    if (users.length === 0) {
      return buildErrorResponse(res, constants.errors.invalidCredentials, 404);
    }

    const user = users[0];

    return buildObjectResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        profileImage: user.profileImage,
        phone: user.phone,
        accountDetailsId: user.accountDetailsId,
        dob: user.dob,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query("SELECT * FROM User WHERE id = ?", [userId]);
    const users = rows as any[];
    if (users.length === 0) {
      return buildErrorResponse(res, constants.errors.invalidCredentials, 404);
    }
    const user = users[0];

    const profileImagePath = req.file
      ? `/uploads/profileImages/${req.file.filename}`
      : user.profileImage;

    const updatedData: any = {
      name: req.body.name ?? user.name,
      gender: req.body.gender ?? user.gender,
      profileImage: profileImagePath,
      phone: req.body.phone ?? user.phone,
      dob: req.body.dob ?? user.dob,
    };

    // Update query
    const sql = `
      UPDATE User
      SET name = ?, gender = ?, profileImage = ?, phone = ?, dob = ?
      WHERE id = ?
    `;
    const values = [
      updatedData.name,
      updatedData.gender,
      updatedData.profileImage,
      updatedData.phone,
      updatedData.dob,
      userId
    ];

    await db.query(sql, values);

    return buildObjectResponse(res, {
      message: constants.success.updateSuccess,
      user: updatedData,
    });

  } catch (error: any) {
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};

export const createUser = async (req: any, res: any) => {
  const connection = await db.getConnection();
 try {
    const { name, email, phone, dob, gender, password } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    if (!name || !email || !password || !profileImage || !phone) {
      return buildErrorResponse(res, constants.errors.invalidRequest, 400);
    }

    const [existing] = await connection.query("SELECT * FROM User WHERE email = ?", [email]);
    if ((existing as any[]).length > 0) {
      return buildErrorResponse(res, constants.errors.emailExisted, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    const [userResult]: any = await connection.query(
      `INSERT INTO User (name, email, phone, dob, gender, profileImage, password) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, dob || null, gender || null, profileImage, hashedPassword]
    );
    const userId = userResult.insertId;

    const [walletResult]: any = await connection.query(
      `INSERT INTO Wallet (userId, totalPoints, totalAmountRedeemed) VALUES (?, ?, ?)`,
      [userId, 0, 0]
    );
    const walletId = walletResult.insertId;

    await connection.commit();

    return buildObjectResponse(res, {
      message: constants.success.accountCreated,
      user: {
        id: userId,
        name,
        email,
        phone,
        dob,
        gender,
        profileImage,
      },
      wallet: {
        id: walletId,
        userId,
        totalPoints: 0,
        totalAmountRedeemed: 0,
      }
    });

  } catch (error: any) {
    await connection.rollback();
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  } finally {
    connection.release();
  }
};

export const deleteUser = async (req: any, res: any) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;

    const [rows] = await connection.query("SELECT * FROM User WHERE id = ?", [userId]);
    if ((rows as any[]).length === 0) {
      return buildErrorResponse(res, constants.errors.userNotFound, 400);
    }

    await connection.beginTransaction();

    await connection.query("DELETE FROM User WHERE id = ?", [userId]);

    await connection.commit();

    return buildObjectResponse(res, {
      message: constants.success.accountDeleted,
      success: true
    });

  } catch (error: any) {
    await connection.rollback();
    console.error("Error deleting account:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  } finally {
    connection.release();
  }
};