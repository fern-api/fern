export type { GraphQLConverterResult, GraphQlExampleInput, GraphQlOperationExamplesInput } from "./GraphQLConverter.js";
export { GraphQLConverter } from "./GraphQLConverter.js";

// GraphQL → IR conversion (for SDK generation)
export { GraphQLToIRConverter } from "./GraphQLToIRConverter.js";
export { generateSelectionQuery } from "./query-generation/index.js";
export type { QueryGenerationConfig } from "./query-generation/index.js";
