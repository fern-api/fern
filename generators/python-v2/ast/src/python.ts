import { AccessAttribute } from "./AccessAttribute";
import { Class } from "./Class";
import { ClassInstantiation } from "./ClassInstantiation";
import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Decorator } from "./Decorator";
import { Field } from "./Field";
import { Lambda } from "./Lambda";
import { LambdaParameter } from "./LambdaParameter";
import { Method } from "./Method";
import { MethodArgument } from "./MethodArgument";
import { MethodInvocation } from "./MethodInvocation";
import { Operator } from "./Operator";
import { Parameter } from "./Parameter";
import { PythonFile } from "./PythonFile";
import { Reference } from "./Reference";
import { StarImport } from "./StarImport";

export { AccessAttribute } from "./AccessAttribute";
export { AstNode } from "./core/AstNode";
export { Class } from "./Class";
export { ClassInstantiation } from "./ClassInstantiation";
export { CodeBlock } from "./CodeBlock";
export { Comment } from "./Comment";
export { Decorator } from "./Decorator";
export { Field } from "./Field";
export { Lambda } from "./Lambda";
export { LambdaParameter } from "./LambdaParameter";
export { Method } from "./Method";
export { MethodArgument } from "./MethodArgument";
export { MethodInvocation } from "./MethodInvocation";
export { Parameter } from "./Parameter";
export { PythonFile } from "./PythonFile";
export { Operator } from "./Operator";
export { Reference } from "./Reference";
export { StarImport } from "./StarImport";
export { Type } from "./Type";
export { TypeInstantiation } from "./TypeInstantiation";

export function accessAttribute(args: AccessAttribute.Args): AccessAttribute {
    return new AccessAttribute(args);
}

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

export function starImport(args: StarImport.Args): StarImport {
    return new StarImport(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function codeBlock(args: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(args);
}

export function comment(args: Comment.Args): Comment {
    return new Comment(args);
}

export function lambda(args: Lambda.Args): Lambda {
    return new Lambda(args);
}

export function lambdaParameter(args: LambdaParameter.Args): LambdaParameter {
    return new LambdaParameter(args);
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
