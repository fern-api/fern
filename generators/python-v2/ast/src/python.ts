import { Class } from "./Class";
import { Field } from "./Field";
import { Reference } from "./Reference";
import { CodeBlock } from "./CodeBlock";
import { Method } from "./Method";
import { MethodInvocation } from "./MethodInvocation";
import { ClassInstantiation } from "./ClassInstantiation";
import { Parameter } from "./Parameter";
import { MethodArgument } from "./MethodArgument";
import { PythonFile } from "./PythonFile";
import { Decorator } from "./Decorator";
import { Operator } from "./Operator";

export { AstNode } from "./core/AstNode";
export { Class } from "./Class";
export { Field } from "./Field";
export { Reference } from "./Reference";
export { CodeBlock } from "./CodeBlock";
export { Method } from "./Method";
export { MethodInvocation } from "./MethodInvocation";
export { ClassInstantiation } from "./ClassInstantiation";
export { Parameter } from "./Parameter";
export { MethodArgument } from "./MethodArgument";
export { PythonFile } from "./PythonFile";
export { Decorator } from "./Decorator";
export { Operator } from "./Operator";
export { Type } from "./Type";
export { TypeInstantiation } from "./TypeInstantiation";

export function file(args: PythonFile.Args): PythonFile {
    return new PythonFile(args);
}

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
    return new ClassInstantiation(args);
}

export function decorator(args: Decorator.Args): Decorator {
    return new Decorator(args);
}

export function reference(args: Reference.Args): Reference {
    return new Reference(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function codeBlock(args: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args);
}

export function methodArgument(args: MethodArgument.Args): MethodArgument {
    return new MethodArgument(args);
}

export function operator(args: Operator.Args): Operator {
    return new Operator(args);
}
