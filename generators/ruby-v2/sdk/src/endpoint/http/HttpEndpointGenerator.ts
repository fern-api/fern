import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace HttpEndpointGenerator {
    export interface GenerateArgs {
        endpoint: HttpEndpoint;
    }
}

export class HttpEndpointGenerator {
    private context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate({
        endpoint,
    }: HttpEndpointGenerator.GenerateArgs): ruby.Method[] {
        return [this.generateUnpagedMethod({ endpoint })];
    }

    private generateUnpagedMethod({
        endpoint,
    }: {
        endpoint: HttpEndpoint;
    }): ruby.Method {
        return ruby.method({
            name: endpoint.name.snakeCase.safeName,
            statements: [
                ruby.codeblock((writer) => {
                    writer.writeLine("raise NotImplementedError, 'This method is not yet implemented.'");
                })
            ]
        });
    }
}
