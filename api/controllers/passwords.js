const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const { validateRequest } = require("../validators/shared");

const Password = require("../../models/password");
const config = require("../../config");

exports.createPassword = async (req, res, next) => {
  try {
    validateRequest(req);
    const userId = req.userId;
    const passwordInfo = req.body;
    const password = new Password({
      url: passwordInfo.url,
      login: passwordInfo.login,
      secondLogin: passwordInfo.secondLogin,
      notes: passwordInfo.notes,
      name: passwordInfo.name.toLowerCase(),
      password: passwordInfo.password,
      userId: userId,
    });
    await password.save();
    res.status(201).json({ message: "Password created" });
  } catch (error) {
    return next(error);
  }
};

exports.searchPassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const searchKey = req.query.search;
    let passwordsFound = [];
    if (searchKey != null && searchKey !== "") {
      const regex = new RegExp(escapeRegex(req.query.search), "gi");
      passwordsFound = await Password.find({ name: regex });
    } else {
      passwordsFound = await Password.find({ userId: userId });
      passwordsFound.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        }
        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        }
        return 0;
      });
    }
    const ret = passwordsFound.map((k) => {
      return {
        _id: k._id,
        url: k.url,
        login: k.login,
        secondLogin: k.secondLogin,
        notes: k.notes,
        name: k.name,
        password: k.password,
        userId: k.userId,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt,
        __v: k.__v,
      };
    });
    res.status(200).json(ret.filter((k) => k.userId == userId));
  } catch (error) {
    return next(error);
  }
};

exports.getPasswords = async (req, res, next) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const passwords = await Password.find({ userId: userId }).sort({ name: 1 });
    const ret = passwords.map((k) => {
      return {
        _id: k._id,
        url: k.url,
        login: k.login,
        secondLogin: k.secondLogin,
        notes: k.notes,
        name: k.name,
        password: k.password,
        userId: k.userId,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt,
        __v: k.__v,
      };
    });

    res.status(200).json(ret);
  } catch (error) {
    return next(error);
  }
};

exports.getPassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const passwordId = req.params.passwordId;

    const password = await Password.findOne({
      $and: [{ _id: passwordId }, { userId: userId }],
    });
    if (!password) {
      const error = new Error("Password not found");
      error.statusCode = 404;
      throw error;
    }

    const ret = {
      _id: password._id,
      url: password.url,
      login: password.login,
      secondLogin: password.secondLogin,
      notes: password.notes,
      name: password.name,
      password: password.password,
      userId: password.userId,
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
      __v: password.__v,
    };

    res.status(200).json(ret);
  } catch (error) {
    return next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    validateRequest(req);

    const passwordId = req.params.passwordId;
    const url = req.body.url;
    const name = req.body.name.toLowerCase();
    const login = req.body.login;
    const secondLogin = req.body.secondLogin;
    const password = req.body.password;
    const notes = req.body.notes;

    const passwordToUpdate = await Password.findById(passwordId);

    if (!passwordToUpdate) {
      const error = new Error("Password not found");
      error.statusCode = 404;
      throw error;
    }

    if (passwordToUpdate.name !== name) {
      passwordToUpdate.name = name;
    }
    if (passwordToUpdate.login !== login) {
      passwordToUpdate.login = login;
    }
    if (passwordToUpdate.secondLogin !== secondLogin) {
      passwordToUpdate.secondLogin = secondLogin;
    }
    if (password !== passwordToUpdate.password) {
      passwordToUpdate.password = password;
    }
    if (passwordToUpdate.url !== url) {
      passwordToUpdate.url = url;
    }
    if (passwordToUpdate.notes !== notes) {
      passwordToUpdate.notes = notes;
    }
    await passwordToUpdate.save();

    res.status(200).json({
      message: "Password updated",
    });
  } catch (error) {
    return next(error);
  }
};

exports.deletePassword = async (req, res, next) => {
  try {
    const passwordId = req.params.passwordId;
    const userId = req.userId;
    const password = await Password.findOne({
      $and: [{ _id: passwordId }, { userId: userId }],
    });
    if (!password) {
      const error = new Error("Password not found");
      error.statusCode = 404;
      throw error;
    }
    await password.remove();
    res.status(200).json({
      message: "Password deleted",
    });
  } catch (error) {
    return next(error);
  }
};

exports.importFromFile = async (req, res, next) => {
  try {
    if (req.body?.AUTHENTIFIANT == undefined || req.body.AUTHENTIFIANT.length == 0) {
      const error = new Error("No data provided.");
      error.statusCode = 422;
      throw error;
    }

    const userId = req.userId;

    let newPwd;
    for (let password of req.body.AUTHENTIFIANT) {
      if (!password.title || !password.password) {
        const error = new Error(
          `One password in the list is missing the title or the password field.`
        );
        error.statusCode = 422;
        throw error;
      }
      newPwd = new Password({
        name: password.title.toLowerCase(),
        login: password.login,
        secondLogin: password.secondLogin || "",
        password: password.password,
        url: password.domain,
        notes: password.note,
        userId: userId,
      });
      newPwd.save();
    }
    res.status(201).json({ message: "Passwords imported" });
  } catch (error) {
    return next(error);
  }
};

exports.exportPasswords = async (req, res, next) => {
  try {
    const fileName = `${uuid.v4()}.json`;
    const filePath = `${config.rootPath}/public/${fileName}`;

    const userId = req.userId;

    const passwords = await Password.find({ userId: userId }).sort({ name: 1 });
    const exportedPasswords = {
      AUTHENTIFIANT: [],
    };

    for (let password of passwords) {
      exportedPasswords.AUTHENTIFIANT.push({
        domain: password.url,
        login: password.login,
        secondLogin: password.secondLogin,
        note: password.notes,
        title: password.name,
        password: password.password,
      });
    }

    res.status(200).json(exportedPasswords);
    // fs.writeFileSync(filePath, JSON.stringify(exportedPasswords, null, "\t"));

    // res.download(filePath, () => {
    //   if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //   }
    // });
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return next(error);
  }
};

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
