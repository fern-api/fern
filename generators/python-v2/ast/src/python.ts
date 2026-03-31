import { AccessAttribute } from "./AccessAttribute.js";
import { Assign } from "./Assign.js";
import { BaseInvocation } from "./BaseInvocation.js";
import { Class } from "./Class.js";
import { ClassInstantiation } from "./ClassInstantiation.js";
import { CodeBlock } from "./CodeBlock.js";
import { Comment } from "./Comment.js";
import { Decorator } from "./Decorator.js";
import { Field } from "./Field.js";
import { Lambda } from "./Lambda.js";
import { LambdaParameter } from "./LambdaParameter.js";
import { Method } from "./Method.js";
import { MethodArgument } from "./MethodArgument.js";
import { MethodInvocation } from "./MethodInvocation.js";
import { Operator } from "./Operator.js";
import { Parameter } from "./Parameter.js";
import { PythonFile } from "./PythonFile.js";
import { Reference } from "./Reference.js";
import { StarImport } from "./StarImport.js";

export { AccessAttribute } from "./AccessAttribute.js";
export { Class } from "./Class.js";
export { ClassInstantiation } from "./ClassInstantiation.js";
export { CodeBlock } from "./CodeBlock.js";
export { Comment } from "./Comment.js";
export { AstNode } from "./core/AstNode.js";
export { Decorator } from "./Decorator.js";
export { Field } from "./Field.js";
export { Lambda } from "./Lambda.js";
export { LambdaParameter } from "./LambdaParameter.js";
export { Method } from "./Method.js";
export { MethodArgument } from "./MethodArgument.js";
export { MethodInvocation } from "./MethodInvocation.js";
export { ModuleImport } from "./ModuleImport.js";
export { Operator } from "./Operator.js";
export { Parameter } from "./Parameter.js";
export { PythonFile } from "./PythonFile.js";
export { Reference } from "./Reference.js";
export { StarImport } from "./StarImport.js";
export { Type } from "./Type.js";
export { type NamedValue, TypeInstantiation } from "./TypeInstantiation.js";

export function accessAttribute(args: AccessAttribute.Args): AccessAttribute {
    return new AccessAttribute(args);
}

export function assign(args: Assign.Args): Assign {
    return new Assign(args);
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

export function invokeFunction(args: BaseInvocation.Args): BaseInvocation {
    return new BaseInvocation(args);
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
