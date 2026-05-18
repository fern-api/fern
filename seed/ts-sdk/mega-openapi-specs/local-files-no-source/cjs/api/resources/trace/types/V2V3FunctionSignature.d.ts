export type V2V3FunctionSignature = {
    type: "void";
} | {
    type: "nonVoid";
} | {
    type: "voidThatTakesActualResult";
};
