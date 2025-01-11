import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function join(first: RelativeFilePath, ...parts: RelativeFilePath[]): RelativeFilePath;
export function join(first: AbsoluteFilePath, ...parts: RelativeFilePath[]): AbsoluteFilePath;
export function join(...parts: RelativeFilePath[]): RelativeFilePath;
export function join(first: string, ...parts: string[]): AbsoluteFilePath;
export function join(...parts: string[]): string {
    const stack: string[] = [];
    for (const part of parts.flatMap((segment) => segment.split("/")).filter(Boolean)) {
        if (part === "." || part === "") {
            continue;
        }
        if (part === "..") {
            if (stack.length > 0 && stack[stack.length - 1] !== "..") {
                stack.pop();
            } else {
                stack.push(part);
            }
        } else {
            stack.push(part);
        }
    }
    return (parts[0]?.startsWith("/") ? "/" : "") + stack.join("/");
}
