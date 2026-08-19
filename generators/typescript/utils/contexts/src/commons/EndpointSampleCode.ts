import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

export interface EndpointSampleCode {
    imports: ts.Statement[];
    endpointInvocation: ts.Expression;
}

export namespace EndpointSampleCode {
    export function convertToString(sample: EndpointSampleCode): string {
        const imports = sample.imports.map(getTextOfTsNode).join("\n");
        const endpointInvocation = getTextOfTsNode(sample.endpointInvocation);
        return `${imports}\n${endpointInvocation}`.trim();
    }
}
