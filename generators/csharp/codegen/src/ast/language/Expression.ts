import { type ClassInstantiation } from "../code/ClassInstantiation";
import { type Literal } from "../code/Literal";
import { type MethodInvocation } from "../code/MethodInvocation";
import { type AstNode } from "../core/AstNode";
import { type CodeBlock } from "../language/CodeBlock";

export type Expression = string | Literal | ClassInstantiation | MethodInvocation;

export type Statement = string | CodeBlock | (AstNode | string)[];

export type NamedNode = AstNode & { name: string };
