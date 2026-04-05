import StoreSettings from "@/lib/models/settings-model";
import type { GraphQLContext } from "@/lib/graphql/context";

export const settingsResolvers = {
  Query: {
    storeSettings: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.isAdmin) {
        throw new Error("Not authorized");
      }

      let settings = await StoreSettings.findOne();
      if (!settings) {
        // Create default settings if none exist
        settings = await StoreSettings.create({});
      }
      return settings;
    },
  },

  Mutation: {
    updateStoreSettings: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.isAdmin) {
        throw new Error("Not authorized");
      }

      const settings = await StoreSettings.findOneAndUpdate(
        {},
        { ...input, updatedAt: new Date() },
        { new: true, upsert: true } // upsert creates if not exists
      );

      return settings;
    },
  },
};