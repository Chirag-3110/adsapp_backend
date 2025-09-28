import { constants } from "../constants";
import { generateJWT } from "../utils";
import { buildErrorResponse, buildObjectResponse } from "../utils/responseUtils";
import db from '../database/sqlConnect';
import bcrypt from 'bcrypt';
import { log } from "util";

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
        isRegistered: user.isRegistered
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
      return buildErrorResponse(res, "User not found", 404);
    }

    const user = users[0];
    const [walletRows] = await db.query("SELECT * FROM Wallet WHERE userId = ?", [userId]);
    const wallets = walletRows as any[];

    const wallet = wallets.length > 0 ? wallets[0] : null;

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
      wallet
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

export const signupUser = async (req: any, res: any) => {
  const connection = await db.getConnection();
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return buildErrorResponse(res, constants.errors.emailPassReq, 400);
    }

    const [existing] = await connection.query("SELECT * FROM User WHERE email = ?", [email]);
    if ((existing as any[]).length > 0) {
      return buildErrorResponse(res, constants.errors.emailExisted, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    const [userResult]: any = await connection.query(
      `INSERT INTO User (email, password, isRegistered) VALUES (?, ?, ?)`,
      [email, hashedPassword, 0]
    );
    const userId = userResult.insertId;

    const [walletResult]: any = await connection.query(
      `INSERT INTO Wallet (userId, totalPoints, totalAmountRedeemed) VALUES (?, ?, ?)`,
      [userId, 0, 0]
    );
    const walletId = walletResult.insertId;

    await connection.commit();

    const token = generateJWT({ id: userId, email });

    return buildObjectResponse(res, {
      message: constants.success.accountCreated,
      token,
      user: {
        id: userId,
        email,
      },
    });

  } catch (error: any) {
    await connection.rollback();
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  } finally {
    connection.release();
  }
};


export const createUser = async (req: any, res: any) => {
 try {
    const userId = req.user.id; 
    const { name, phone, dob, gender } = req.body;
    
    const profileImage = req.file ? `/uploads/profileImages/${req.file.filename}` : null;
  
    if (!name || !phone || !dob || !gender ) {
      return buildErrorResponse(res, "All fields (name, phone, dob, gender are required", 400);
    }

    const [rows] = await db.query("SELECT * FROM User WHERE id = ?", [userId]);
    const user: any = rows as any[];
    if ((rows as any[]).length === 0) {
      return buildErrorResponse(res, constants.errors.userNotFound, 404);
    }

    const sql = `
      UPDATE User 
      SET name = ?, phone = ?, dob = ?, gender = ?, profileImage = ?, isRegistered = ?
      WHERE id = ?
    `;
    await db.query(sql, [name, phone, dob, gender, profileImage, 1, userId]);

    return buildObjectResponse(res, {
      message: constants.success.profileCompleted,
      user: {
        id: userId,
        name,
        phone,
        dob,
        gender,
        profileImage,
        email: user.email,
      }
    });

  } catch (error: any) {
    console.error("Error completing profile:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
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

export const userAnalytics = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const [todayEarnings]: any = await db.query(
      `SELECT COALESCE(SUM(pointsEarned), 0) as todayPoints
       FROM Earning
       WHERE userId = ? AND DATE(createdAt) = CURDATE()`,
      [userId]
    );

    const [weekEarnings]: any = await db.query(
      `SELECT COALESCE(SUM(pointsEarned), 0) as weekPoints
       FROM Earning
       WHERE userId = ? AND YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)`,
      [userId]
    );

    const [monthEarnings]: any = await db.query(
      `SELECT COALESCE(SUM(pointsEarned), 0) as monthPoints
       FROM Earning
       WHERE userId = ? 
         AND YEAR(createdAt) = YEAR(CURDATE())
         AND MONTH(createdAt) = MONTH(CURDATE())`,
      [userId]
    );

    const [todayTransactions]: any = await db.query(
      `SELECT 
         COALESCE(SUM(pointsRedeemed), 0) as todayPointsRedeemed,
         COALESCE(SUM(amountRedeemed), 0) as todayAmountRedeemed
       FROM Transaction
       WHERE userId = ? AND DATE(createdAt) = CURDATE() AND status = 'COMPLETED'`,
      [userId]
    );

    const [weekTransactions]: any = await db.query(
      `SELECT 
         COALESCE(SUM(pointsRedeemed), 0) as weekPointsRedeemed,
         COALESCE(SUM(amountRedeemed), 0) as weekAmountRedeemed
       FROM Transaction
       WHERE userId = ? AND YEARWEEK(createdAt, 0) = YEARWEEK(CURDATE(), 0) AND status = 'COMPLETED'`,
      [userId]
    );

    const [monthTransactions]: any = await db.query(
      `SELECT 
         COALESCE(SUM(pointsRedeemed), 0) as monthPointsRedeemed,
         COALESCE(SUM(amountRedeemed), 0) as monthAmountRedeemed
       FROM Transaction
       WHERE userId = ? 
         AND YEAR(createdAt) = YEAR(CURDATE())
         AND MONTH(createdAt) = MONTH(CURDATE())
         AND status = 'COMPLETED'`,
      [userId]
    );

     const [latestTransactions]: any = await db.query(
      `SELECT *
       FROM Transaction
       WHERE userId = ? AND status = 'COMPLETED'
       ORDER BY createdAt DESC
       LIMIT 5`,
      [userId]
    );

    return buildObjectResponse(res, {
      message: "User analytics fetched successfully",
      earnings: {
        today: todayEarnings[0].todayPoints,
        week: weekEarnings[0].weekPoints,
        month: monthEarnings[0].monthPoints,
      },
      transactions: {
        today: todayTransactions[0],
        week: weekTransactions[0],
        month: monthTransactions[0],
      },
      latestTransactions: latestTransactions
    });
  } catch (error: any) {
    console.error("Error fetching user analytics:", error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  }
};

export const getUserDashboard = async (req: any, res: any) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;

    const [rows] = await connection.query(
      `SELECT * FROM Dashboard WHERE userId = ?`,
      [userId]
    );

    let dashboard;
    const todayStr = new Date().toISOString().split('T')[0];

    if ((rows as any[]).length === 0) {
      const [insertResult]: any = await connection.query(
        `INSERT INTO Dashboard (userId, visitedDate, dailyAdClaimedDate) VALUES (?, ?, ?)`,
        [userId, null, null]
      );
      dashboard = {
        visitedToday: false,
        adClaimedToday: false,
      };
    } else {
      const record = (rows as any[])[0];

      const visitedToday = record.visitedDate === todayStr;
      const adClaimedToday = record.dailyAdClaimedDate === todayStr;

      dashboard = {
        visitedToday,
        adClaimedToday,
      };
    }

    return buildObjectResponse(res, {
      message: 'User dashboard fetched successfully',
      dashboard,
    });

  } catch (error: any) {
    console.error('Error fetching user dashboard:', error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  } finally {
    connection.release();
  }
};

export const updateUserDashboard = async (req: any, res: any) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    const { keyName, points } = req.body;

    if (!keyName || !['visitedDate', 'dailyAdClaimedDate'].includes(keyName)) {
      return buildErrorResponse(res, 'Invalid keyName. Use visitedDate or dailyAdClaimedDate', 400);
    }

    const todayStr = new Date().toISOString().split('T')[0]; 

    const [rows] = await connection.query(
      `SELECT * FROM Dashboard WHERE userId = ?`,
      [userId]
    );

    if ((rows as any[]).length === 0) {
      await connection.query(
        `INSERT INTO Dashboard (userId, visitedDate, dailyAdClaimedDate) VALUES (?, ?, ?)`,
        [userId, keyName === 'visitedDate' ? todayStr : null, keyName === 'dailyAdClaimedDate' ? todayStr : null]
      );
    } else {
      const record = (rows as any[])[0];

      if (record[keyName] === todayStr) {
        return buildErrorResponse(res, `${keyName} is already updated today`, 400);
      }

      const sql = `UPDATE Dashboard SET ${keyName} = ? WHERE userId = ?`;
      await connection.query(sql, [todayStr, userId]);
    }

    if (points && points > 0) {
      const [walletRows] = await connection.query(`SELECT * FROM Wallet WHERE userId = ?`, [userId]);
      if ((walletRows as any[]).length === 0) {
        await connection.query(
          `INSERT INTO Wallet (userId, totalPoints) VALUES (?, ?)`,
          [userId, points]
        );
      } else {
        await connection.query(
          `UPDATE Wallet SET totalPoints = totalPoints + ? WHERE userId = ?`,
          [points, userId]
        );
      }
    }

    return buildObjectResponse(res, {
      message: `${keyName} updated successfully`,
      dateUpdated: todayStr,
      pointsAdded: points || 0,
    });

  } catch (error: any) {
    console.error('Error updating dashboard:', error);
    return buildErrorResponse(res, constants.errors.internalServerError, 500);
  } finally {
    connection.release();
  }
};
