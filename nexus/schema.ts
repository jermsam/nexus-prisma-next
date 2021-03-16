import { makeSchema } from 'nexus'
import path from 'path'
import * as types from 'nexus/types'

export const schema = makeSchema({
  types,

  outputs: {
    // I tend to use `.gen` to denote "auto-generated" files, but this is not a requirement.
    schema: path.join(process.cwd(), 'generated/schema.gen.graphql'),
    typegen: path.join(process.cwd(), 'generated/nexusTypes.gen.ts'),
  },
  // Typing for the GraphQL context
  contextType: {
    module: path.join(process.cwd(), '/nexus/context.ts'),
    alias: 'ctx',
    export:'Context'
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})