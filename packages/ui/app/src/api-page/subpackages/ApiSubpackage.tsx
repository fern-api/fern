import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { ApiPackageContents } from "../ApiPackageContents";
import { Markdown } from "../markdown/Markdown";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { SubpackageEndpointsOverview } from "./SubpackageEndpointsOverview";
import { SubpackageTitle } from "./SubpackageTitle";

export declare namespace ApiSubpackage {
    export interface Props {
        subpackageId: FernRegistryApiRead.SubpackageId;
        slug: string;
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({ subpackageId, slug }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    const subpackage = resolveSubpackageById(subpackageId);

    const { setTargetRef } = useApiPageCenterElement({ slug });

    return (
        <>
            <ApiPageMargins>
                <div ref={setTargetRef} className="pt-20 text-4xl font-bold">
                    <SubpackageTitle subpackage={subpackage} />
                </div>
                {subpackage.description != null && (
                    <div className="flex flex-col items-start space-y-5 pt-10 md:flex-row md:space-x-[5vw] md:space-y-0">
                        <Markdown className="flex-1">{subpackage.description}</Markdown>
                        <div className="flex-1">
                            <SubpackageEndpointsOverview subpackage={subpackage} />
                        </div>
                    </div>
                )}
            </ApiPageMargins>
            <ApiPackageContents key={subpackageId} package={subpackage} slug={slug} />
        </>
    );
};
