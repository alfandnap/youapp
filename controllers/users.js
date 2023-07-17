const { ObjectId } = require("mongodb")
const mongoDBConnection = require("../connection")
const { hashPassword, checkPassword } = require("../middlewares/bcrypt")
const { generateToken } = require("../middlewares/authentication")
const getHoroscope = require("../helpers/horoscope")
const getChineseZodiac = require("../helpers/zodiac")

class ControllerUser {

  static async register(req, res, next) {
    try {
      const { db } = mongoDBConnection
      const { username, email, password, password2 } = req.body
      if (!username || !email || !password || !password2) {
        throw { name: 'validation error' }
      }
      if (password !== password2) {
        throw { name: 'validation error' }
      }

      const findEmail = await db.collection('users').findOne({ email })
      if (findEmail) {
        throw { name: 'Invalid' }
      }

      const obj = {
        username,
        email,
        password: hashPassword(password),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const data = await db.collection('users').insertOne(obj)

      res.status(201).json(`success register with id: ${data.insertedId}`)

    } catch (error) {
      next(error)
    }
  }

  static async login(req, res, next) {
    try {
      const { db } = mongoDBConnection

      const { usernameEmail, password } = req.body
      if (!usernameEmail || !password) {
        throw { name: 'Invalid' }
      }

      let founded;
      const findEmail = await db.collection('users').findOne({ email: usernameEmail })
      if (findEmail) {
        founded = findEmail
      }
      const findUsername = await db.collection('users').findOne({ username: usernameEmail })
      if (findUsername) {
        founded = findUsername
      }

      if (!founded) {
        throw { name: 'Invalid' }
      }
      const verifyPassword = checkPassword(password, founded.password)
      if (!verifyPassword) {
        throw { name: 'Invalid' }
      }

      const access_token = generateToken({ id: founded._id.toString() })

      res.status(200).json({ access_token })

    } catch (error) {
      next(error)
    }
  }

  static async createProfile(req, res, next) {
    try {
      const { db } = mongoDBConnection
      const { id } = req.user

      const { displayName, gender, birthday, height, weight } = req.body
      if (!displayName || !gender || !birthday || !height || !weight) {
        throw { name: 'validation error' }
      }

      const horoscope = getHoroscope(birthday)
      const zodiac = getChineseZodiac(birthday)

      const obj = {
        userId: id,
        displayName,
        gender,
        birthday,
        horoscope,
        zodiac,
        height,
        weight,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const data = await db.collection('profiles').insertOne(obj)

      res.status(201).json(`success creating profile with id: ${data.insertedId}`)

    } catch (error) {
      next(error)
    }
  }

  static async getProfile(req, res, next) {
    try {
      const { db } = mongoDBConnection
      const data = await db.collection('profiles')
        .find()
        .project({ password: 0 })
        .toArray()

      res.status(200).json(data)

    } catch (error) {
      next(error)
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { db } = mongoDBConnection

      const { id } = req.user

      const { displayName, gender, birthday, height, weight } = req.body
      if (!displayName || !gender || !birthday || !height || !weight) {
        throw { name: 'validation error' }
      }

      const horoscope = getHoroscope(birthday)
      const zodiac = getChineseZodiac(birthday)

      const data = await db.collection('profiles').updateOne(
        { userId: id },
        {
          $set: { displayName, gender, birthday, horoscope, zodiac, height, weight }
        }
      );
      if (!data.modifiedCount) {
        throw { name: 'NOTFOUND' }
      }

      res.status(200).json(`success updating profile`)

    } catch (error) {
      next(error)
    }
  }

}

module.exports = ControllerUser