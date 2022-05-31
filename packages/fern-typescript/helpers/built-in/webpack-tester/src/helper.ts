import { ts } from "@fern-typescript/helper-utils";

export function helper(): void {
    console.log(ts.factory.createIdentifier("hello"));
}
