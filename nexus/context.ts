require('dotenv').config()

import { PrismaClient } from '@prisma/client'



const prisma = new PrismaClient()

const connectionString = process.env.DATABASE_URL;




export interface Context{
  prisma: PrismaClient,
}


export const context={prisma}