
import {
  objectType, extendType, stringArg, queryField,
  nonNull, nullable, intArg, floatArg,subscriptionField
} from 'nexus'
import { clean } from 'utils'




export const Product = objectType({
  name: 'Product',
  definition(t) {
    
    t.nonNull.int('id', { description: 'ID of the product' })
    t.string('name', { description: 'Name of the product' })
    t.string('description', { description: 'Description of the product' })
    t.float('price', { description: 'Price for the product' })
    t.field('category', {
      type: 'Category',
      resolve: (_root, _, ctx) => {
        
        return ctx.prisma.product
          .findUnique({
           where: { id: _root.id || undefined },
         })
         .category()
        
      }
    })
  }
});

export const createProduct = extendType({
  type: "Mutation",
  definition(t) {
    t.field('createProduct', {
      type: 'Product',
      args: {
        name: nonNull(stringArg()),
        description: nullable(stringArg()),
        price: nonNull(floatArg()),
        categoryId:nonNull(intArg())
      },
      resolve:async (__,args,ctx) =>{
      
        const data = {
          name: args.name,
          description: args.description,
          price: args.price,
          categoryId:args.categoryId
        }
        const product = await ctx.prisma.product.create({ data })
        ctx.pubsub.publish('newProduct', product)
        return product

      }
    })
  }
})

export const updateProduct = extendType({
  type: "Mutation",
  definition(t) {
    t.field('updateProduct', {
      type: 'Product',
      args: {
        id: nonNull(intArg()),
        name: nullable(stringArg()),
        description: nullable(stringArg()),
        price: nullable(floatArg()),
        categoryId:nullable(intArg())
      },
       resolve:async (__,args,ctx) =>{
      
        const id = args.id
       
         delete args[id]
         const data = clean(args);
         
         const product= await ctx.prisma.product.update({data,where: {
          id,
         },})
       ctx.pubsub.publish('productUpdated',product)
        return product

      }
    })
  }
})

export const getProduct= queryField('getProduct', {
  type: 'Product',
  args: {
    id: nonNull(intArg()),
  },

  resolve(_, {id}, ctx) {
   return ctx.prisma.product.findUnique({where:{id},include: {
    category: true, // Return all fields
  },})
  },
})

export const getProducts = extendType({
  type: 'Query',
  definition: t => {
    t.nonNull.list.field('getProducts', {
      type: 'Product',
     
      resolve: (_, __, ctx) => ctx.prisma.product.findMany({include: {
        category: true, // Return all fields
      },}),
    })
  },
})

export const newProductSubscription = subscriptionField('newProduct',{
  type: 'Product',
 
  description: "Fires Any time a new Product is created",
  subscribe: async (_,__, ctx) => 
  ctx.pubsub.asyncIterator('newProduct'),
  resolve:async(eventData) =>eventData,
})


export const productUpdatedSubscription = subscriptionField('productUpdated',{
  type: 'Product',
 
  description: "Fires Any time the product is updated",
  subscribe: async (_,__, ctx) => 
    ctx.pubsub.asyncIterator('productUpdated'),
    resolve:(eventData) =>eventData,
})