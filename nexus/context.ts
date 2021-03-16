require('dotenv').config()

import { PubSub } from 'apollo-server'
import { PrismaClient } from '@prisma/client'
// import { PostgresPubSub } from "graphql-postgres-subscriptions";
// import { Client } from "pg";




export interface Context{
  prisma: PrismaClient
 //  pubsub: PostgresPubSub 
 pubsub: PubSub
}


const prisma = new PrismaClient()
const pubsub = new PubSub()

// const connectionString = process.env.DATABASE_URL;

// const client = new Client({connectionString});

// const pubsub = new PostgresPubSub({ client });




export const context: Context = {
  prisma,
  pubsub,
}