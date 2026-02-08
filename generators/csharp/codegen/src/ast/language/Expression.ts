import { type ClassInstantiation } from "../code/ClassInstantiation.js";
import { type Literal } from "../code/Literal.js";
import { type MethodInvocation } from "../code/MethodInvocation.js";
import { type AstNode } from "../core/AstNode.js";
import { type CodeBlock } from "../language/CodeBlock.js";

export type Expression = string | Literal | ClassInstantiation | MethodInvocation;

export type Statement = string | CodeBlock | (AstNode | string)[];

export type NamedNode = AstNode & { name: string };
