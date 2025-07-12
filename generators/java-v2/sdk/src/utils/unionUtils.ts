// import { IntermediateRepresentation, TypeDeclaration, Type } from "@fern-fern/ir-sdk/api";

// export function findSampleDiscriminatedUnionTypeInIr(ir: IntermediateRepresentation): TypeDeclaration | undefined {
//     for (const typeDeclaration of Object.values(ir.types)) {
//         const isUnionType =Type._visit(typeDeclaration.shape, {
//             object: () => false,
//             enum: () => false,
//             union: () => true,
//             alias: () => false,
//             undiscriminatedUnion: () => false,
//             _other: () => false

//         });
//         if (isUnionType) {
//             return typeDeclaration;
//         }
//     }
//     return undefined;
// }

// export function findSampleUndiscriminatedUnionTypeInIr(ir: IntermediateRepresentation): TypeDeclaration | undefined {
//     for (const typeDeclaration of Object.values(ir.types)) {
//         const isUnionType =Type._visit(typeDeclaration.shape, {
//             object: () => false,
//             enum: () => false,
//             union: () => false,
//             alias: () => false,
//             undiscriminatedUnion: () => true,
//             _other: () => false

//         });
//         if (isUnionType) {
//             return typeDeclaration;
//         }
//     }
//     return undefined;
// }