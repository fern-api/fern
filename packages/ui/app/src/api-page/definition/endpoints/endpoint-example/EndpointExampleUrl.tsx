import { Collapse, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { TwoColumnTable } from "@fern-api/common-components";
import { useBooleanState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import { size } from "lodash-es";
import { useMemo } from "react";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { getPathParameterAsString } from "../getEndpointTitleAsString";
import { EndpointExampleUrlParameters } from "./EndpointExampleUrlParameters";

export declare namespace EndpointExampleUrl {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        example: FernRegistry.ExampleEndpointCall;
    }
}

export const EndpointExampleUrl: React.FC<EndpointExampleUrl.Props> = ({ endpoint, example }) => {
    const { value: isViewingUrlDetails, toggleValue: toggleIsViewingUrlDetails } = useBooleanState(false);

    const hasUrlDetails = size(example.pathParameters) > 0 || size(example.queryParameters) > 0;

    const allowedPathParameters = useMemo(
        () => endpoint.path.pathParameters.map((pathParameter) => pathParameter.key),
        [endpoint.path.pathParameters]
    );
    const allowedQueryParameters = useMemo(
        () => endpoint.queryParameters.map((queryParameter) => queryParameter.key),
        [endpoint.queryParameters]
    );

    return (
        <div className="flex flex-col">
            <MonospaceText>
                <div className="flex">
                    <div className="mr-1">GET</div>
                    <div className="break-all">{example.url}</div>
                </div>
            </MonospaceText>
            {hasUrlDetails && (
                <div className="flex flex-col text-xs text-slate-500 mt-1">
                    <div className="flex items-center cursor-pointer" onClick={toggleIsViewingUrlDetails}>
                        <Icon
                            className="mr-0.5"
                            size={12}
                            icon={isViewingUrlDetails ? IconNames.CHEVRON_DOWN : IconNames.CHEVRON_RIGHT}
                        />
                        <div className="select-none">Parameters</div>
                    </div>
                    <div className="flex ml-5">
                        <Collapse isOpen={isViewingUrlDetails}>
                            <TwoColumnTable className="pt-1 gap-y-1 gap-x-2">
                                <EndpointExampleUrlParameters
                                    allowedKeys={allowedPathParameters}
                                    values={example.pathParameters}
                                    renderKey={getPathParameterAsString}
                                />
                                <EndpointExampleUrlParameters
                                    allowedKeys={allowedQueryParameters}
                                    values={example.queryParameters}
                                />
                            </TwoColumnTable>
                        </Collapse>
                    </div>
                </div>
            )}
        </div>
    );
};
