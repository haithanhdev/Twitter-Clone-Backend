import { Request, Response } from 'express'

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
