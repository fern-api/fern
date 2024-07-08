import { Class, File, FileHeader, Func, Import } from "./ast";
import { Param } from "./ast/Param";

export function makeFileHeader(args: FileHeader.Args): FileHeader {
  return new FileHeader(args);
}

export function makeImport(args: Import.Args): Import {
  return new Import(args);
}

export function makeParam(args: Param.Args): Param {
  return new Param(args);
}

export function makeFunc(args: Func.Args): Func {
  return new Func(args);
}

export function makeClass(args: Class.Args): Class {
  return new Class(args);
}

export function makeFile(args: File.Args): File {
  return new File(args);
}

// export function annotation(args: Annotation.Args): Annotation {
//   return new Annotation(args);
// }

// export function classReference(args: ClassReference.Args): ClassReference {
//   return new ClassReference(args);
// }

// export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
//   return new ClassInstantiation(args);
// }

// export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
//   return new MethodInvocation(args);
// }

// export function coreClassReference(args: CoreClassReference.Args): CoreClassReference {
//   return new CoreClassReference(args);
// }

// export function codeblock(arg: CodeBlock.Arg): CodeBlock {
//   return new CodeBlock(arg);
// }

// export function field(args: Field.Args): Field {
//   return new Field(args);
// }

// export function method(args: Method.Args): Method {
//   return new Method(args);
// }

// export function parameter(args: Parameter.Args): Parameter {
//   return new Parameter(args);
// }

// export function interface_(args: Interface.Args): Interface {
//   return new Interface(args);
// }

// export function enum_(args: Enum.Args): Enum {
//   return new Enum(args);
// }

// export function dictionary(args: Dictionary.Args): Dictionary {
//   return new Dictionary(args);
// }

export {
  Class
} from "./ast";

