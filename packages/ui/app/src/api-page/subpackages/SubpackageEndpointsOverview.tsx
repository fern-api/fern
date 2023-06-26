import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { HttpMethodIcon } from "../../commons/HttpMethodIcon";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { getPathParameterAsString } from "../endpoints/getEndpointTitleAsString";

export declare namespace SubpackageEndpointsOverview {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    }
}

export const SubpackageEndpointsOverview: React.FC<SubpackageEndpointsOverview.Props> = ({ subpackage }) => {
    return (
        <div className="border-border flex flex-col overflow-hidden rounded-xl border">
            <div className="border-border flex h-10 items-center justify-between border-b bg-white/10 px-3 py-1">
                <div className="text-xs uppercase tracking-wide text-neutral-300">Endpoints</div>
            </div>
            <div className="space-y-1.5 p-3">
                {subpackage.endpoints.map((e) => (
                    <div key={e.id} className="flex items-baseline space-x-2">
                        <HttpMethodIcon method={e.method} />
                        <MonospaceText className="text-text-default break-all">
                            {e.path.parts
                                .map((p) => (p.type === "literal" ? p.value : getPathParameterAsString(p.value)))
                                .join("")}
                        </MonospaceText>
                    </div>
                ))}
            </div>
        </div>
    );
};
