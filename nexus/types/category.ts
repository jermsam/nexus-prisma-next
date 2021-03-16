import {objectType,extendType,stringArg,queryField,nonNull,nullable,intArg,subscriptionField} from 'nexus'
import { Product } from 'nexus/types/product'
import {clean} from 'utils'

export const Category = objectType({
  name: 'Category',
  definition(t) {
    
    t.int('id', { description: 'ID of the category' })
    t.string('name', { description: 'Name of the category' })
    t.string('description', { description: 'Description of the category' })
    t.list.field('products', {

      type: Product,
      
      resolve: (_root, _, ctx) => {
        
        return ctx.prisma.product
          .findMany({
           where: { categoryId: _root.id || undefined },
         })
         
        
      }
    })
  }
});

export const createCategory = extendType({
  type: "Mutation",
  definition(t) {
    t.field('createCategory', {
      type: 'Category',
      args: {
        name: nonNull(stringArg()),
        description: nullable(stringArg())
      },
      resolve:async (__,args,ctx) =>{
      
        const data = {
          name: args.name,
          description:args.description
        }
        const category = await ctx.prisma.category.create({ data })
        ctx.pubsub.publish('newCategory',category)
        return category

      }
    })
  }
})


export const updateCategory = extendType({
  type: "Mutation",
  definition(t) {
    t.field('updateCategory', {
      type: 'Category',
      args: {
        id: nonNull(intArg()),
        name: nullable(stringArg()),
        description: nullable(stringArg())
      },
       resolve:async (__,args,ctx) =>{
      
        const id = args.id
       
         delete args[id]
         const data = clean(args);
         const category = await ctx.prisma.category.update({data,where: {
          id,
         },})
       ctx.pubsub.publish('categoryUpdated',category)
        return category

      }
    })
  }
})

export const getCategory= queryField('getCategory', {
  type: 'Category',
  args: {
    id: nonNull(intArg()),
  },

  resolve(_, {id}, ctx) {
   return ctx.prisma.category.findUnique({where:{id},include: {
    products: true, // Return all fields
  },})
  },
})

export const getCategories = extendType({
  type: 'Query',
  definition: t => {
    t.nonNull.list.field('getCategories', {
      type: 'Category',
     
      resolve: (_, __, ctx) => ctx.prisma.category.findMany({include: {
        products: true, // Return all fields
      },}),
    })
  },
})

export const newCategorySubscription = subscriptionField('newCategory',{
  type: 'Category',
 
  description: "Fires Any time a new Category",
  subscribe: async (_,__, { prisma,pubsub }) => 
  pubsub.asyncIterator('newCategory'),
  resolve:(eventData) =>eventData,
})

export const categoryUpdatedSubscription = subscriptionField('categoryUpdated',{
  type: 'Category',
 
  description: "Fires Any time the category is updated",
  subscribe: async (_,__, { prisma,pubsub }) => 
  pubsub.asyncIterator('categoryUpdated'),
  resolve:(eventData) =>eventData,
})