import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'user@gmail.com' && password === '123') {
    res.json({
      message: 'Login success'
    })
    return
  }
  res.status(400).json({
    error: 'Login failed'
  })
  return
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email, password })
    res.json({
      message: 'Register success',
      result: result
    })
    return
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: 'Register failed',
      error
    })
    return
  }
}
