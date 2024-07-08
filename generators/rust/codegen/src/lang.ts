import * as Ast from "./ast";
export * from "./ast";

// Breakdown the language functionality here. 
// Checkout Swift or CSharp for more inspiration
// export function makeField(args: Ast.NAME.Args): Ast.NAME {
//   return new Ast.NAME(args);
// }

export function makeFunction(args: Ast.Func.Args): Ast.Func {
  return new Ast.Func(args);
}

export function makeClass(args: Ast.Class.Args): Ast.Class {
  return new Ast.Class(args);
}

export function makeFile(args: Ast.File.Args): Ast.File {
  return new Ast.File(args);
}

