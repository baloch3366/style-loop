// import { ProductFormData } from '@/lib/schemas/product.schema';
// import { Product } from '@/lib/models/product.model';

// // GraphQL generated types (would be auto-generated)
// interface GraphQLProduct {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   category: {
//     id: string;
//     name: string;
//     slug: string;
//   };
//   sku: string;
//   inventory: number;
//   status: string;
//   featured: boolean;
// }

// export class ProductAdapter {
//   // Convert GraphQL response to frontend domain model
//   static fromGraphQL(graphqlProduct: GraphQLProduct) {
//     return {
//       id: graphqlProduct.id,
//       name: graphqlProduct.name,
//       description: graphqlProduct.description,
//       price: graphqlProduct.price,
//       category: {
//         id: graphqlProduct.category.id,
//         name: graphqlProduct.category.name,
//         slug: graphqlProduct.category.slug
//       },
//       sku: graphqlProduct.sku,
//       inventory: graphqlProduct.inventory,
//       status: graphqlProduct.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
//       featured: graphqlProduct.featured
//     };
//   }

//   // Convert form data to GraphQL mutation input
//   static toGraphQLInput(formData: ProductFormData) {
//     return {
//       name: formData.name.trim(),
//       description: formData.description.trim(),
//       price: formData.price,
//       category: formData.categoryId,
//       inventory: formData.inventory,
//       status: formData.status,
//       featured: formData.featured
//     };
//   }

//   // Convert database model to GraphQL response
//   static fromDatabase(dbProduct: any): GraphQLProduct {
//     return {
//       id: dbProduct._id.toString(),
//       name: dbProduct.name,
//       description: dbProduct.description,
//       price: dbProduct.price,
//       category: {
//         id: dbProduct.category._id.toString(),
//         name: dbProduct.category.name,
//         slug: dbProduct.category.slug
//       },
//       sku: dbProduct.sku,
//       inventory: dbProduct.inventory,
//       status: dbProduct.status,
//       featured: dbProduct.featured
//     };
//   }
// }