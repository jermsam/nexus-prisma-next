import {objectType,extendType,stringArg,queryField,nonNull,nullable,intArg} from 'nexus'
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
      resolve:(__,args,ctx) =>{
      
        const data = {
          name: args.name,
          description:args.description
        }
        return ctx.prisma.category.create({data})

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
         
       
        return ctx.prisma.category.update({data,where: {
         id,
        },})

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