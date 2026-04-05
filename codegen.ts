import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
schema: './lib/graphql/schema/**/*.ts',
  documents: [
    'lib/graphql/queries/**/*.ts',
    'lib/graphql/fragments/**/*.ts',
    'app/**/*.tsx'
  ],
  ignoreNoDocuments: true,
  
  generates: {
    './lib/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false,          
      },
      config: {
        scalars: {
          DateTime: 'string',
          JSON: 'any',
        },
        useTypeImports: true,
        skipTypename: false,
      },
    },

    './lib/graphql/generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../../context#GraphQLContext',
        useIndexSignature: true,
        scalars: {
          DateTime: 'string',
          JSON: 'any',
        },
      },
    },
  },
};

export default config;