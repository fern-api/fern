import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { ApiPackageContents } from "../ApiPackageContents";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
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
            </ApiPageMargins>
            <ApiPackageContents key={subpackageId} package={subpackage} slug={slug} />
        </>
    );
};
