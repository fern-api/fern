import * as Ast from "./ast";

export const INDENT_SIZE = 4;

export function makeFileHeader(args: Ast.FileHeader.Args): Ast.FileHeader {
  return new Ast.FileHeader(args);
}

export function makeImport(args: Ast.Import.Args): Ast.Import {
  return new Ast.Import(args);
}

export function makeParam(args: Ast.Param.Args): Ast.Param {
  return new Ast.Param(args);
}

export function makeFunc(args: Ast.Func.Args): Ast.Func {
  return new Ast.Func(args);
}

export function makeClass(args: Ast.Class.Args): Ast.Class {
  return new Ast.Class(args);
}

export function makeFile(args: Ast.File.Args): Ast.File {
  return new Ast.File(args);
}