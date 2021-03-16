// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ApolloServer } from 'apollo-server-micro'
import { schema } from 'nexus/schema'
import { context } from 'nexus/context';




const server = new ApolloServer({ schema ,context});

export const config={
  api: {
    bodyParser: false,
  },
}

export default server.createHandler({path:'/api/graphql'})