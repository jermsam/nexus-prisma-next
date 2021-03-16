// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ApolloServer } from 'apollo-server-micro'
import { NextApiRequest, NextApiResponse } from 'next'
import { schema } from 'nexus/schema'
import { context } from 'nexus/context';




const apolloServer = new ApolloServer({
  schema, context,
  subscriptions: {
    path: "/api/graphqlSubscriptions",
    // keepAlive: 15000,
    onConnect: (connectionParams, webSocket) => console.log("connected",connectionParams),
    onDisconnect: () => console.log("disconnected"),
  },
  playground: {
    subscriptionEndpoint: '/api/graphqlSubscriptions',

    settings: {
      'request.credentials': 'same-origin',
    },
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
}

type CustomSocket = Exclude<NextApiResponse<any>['socket'], null> & {
  server: Parameters<ApolloServer['installSubscriptionHandlers']>[0] & {
    apolloServer?: ApolloServer
    apolloServerHandler?: any
  }
}

type CustomNextApiResponse<T = any> = NextApiResponse<T> & {
  socket: CustomSocket
}

const graphqlWithSubscriptionHandler = (
  req: NextApiRequest,
  res: CustomNextApiResponse
) => {
  const oldOne = res.socket.server.apolloServer
  if (
    //we need compare old apolloServer with newOne, becasue after hot-reload are not equals
    oldOne &&
    oldOne !== apolloServer
  ) {
    console.warn('FIXING HOT RELOAD !!!!!!!!!!!!!!! ')
    delete res.socket.server.apolloServer
  }

  if (!res.socket.server.apolloServer) {
    console.log(`* apolloServer (re)initialization *`)

    apolloServer.installSubscriptionHandlers(res.socket.server)
    res.socket.server.apolloServer = apolloServer
    const handler = apolloServer.createHandler({ path: '/api/graphql' })
    res.socket.server.apolloServerHandler = handler
    //clients losts old connections, but clients are able to reconnect
    oldOne?.stop()
  }

  return res.socket.server.apolloServerHandler(req, res)
}

export default graphqlWithSubscriptionHandler