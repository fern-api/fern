import { FernRegistry } from "@fern-fern/registry";
import { size } from "lodash-es";
import React from "react";
import { EndpointExampleUrlParameter } from "./EndpointExampleUrlParameter";

export declare namespace EndpointExampleUrl {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        example: FernRegistry.ExampleEndpointCall;
    }
}

export const EndpointExampleUrl: React.FC<EndpointExampleUrl.Props> = ({ endpoint, example }) => {
    return (
        <div className="text-[#DBDCDB] break-all">
            {endpoint.path.parts.map((part, index) => (
                <React.Fragment key={index}>
                    {part._visit<JSX.Element | string | null>({
                        pathParameter: (pathParameter) => {
                            const value = example.pathParameters[pathParameter];
                            if (value == null) {
                                throw new Error("Path parameter key does not exist: " + pathParameter);
                            }
                            return (
                                <EndpointExampleUrlParameter>{value as string | number}</EndpointExampleUrlParameter>
                            );
                        },
                        literal: (literal) => literal,
                        _other: () => null,
                    })}
                </React.Fragment>
            ))}
            {size(example.queryParameters) > 0 && (
                <>
                    ?
                    {Object.entries(example.queryParameters).map(([key, value]) => (
                        <React.Fragment key={key}>
                            {key}=<EndpointExampleUrlParameter>{value as string | number}</EndpointExampleUrlParameter>
                        </React.Fragment>
                    ))}
                </>
            )}
        </div>
    );
};
