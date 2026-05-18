export type V2FunctionSignature = {
    type: "void";
} | {
    type: "nonVoid";
} | {
    type: "voidThatTakesActualResult";
};
