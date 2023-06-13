import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { PageMargins } from "../../page-margins/PageMargins";
import { ApiPackageContents } from "../ApiPackageContents";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { SubpackageTitle } from "./SubpackageTitle";

export declare namespace ApiSubpackage {
    export interface Props {
        subpackageId: FernRegistryApiRead.SubpackageId.Raw;
        slug: string;
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({ subpackageId, slug }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    const subpackage = resolveSubpackageById(subpackageId);

    const { setTargetRef } = useApiPageCenterElement({ slug });

    return (
        <>
            <PageMargins>
                <div ref={setTargetRef} className="pt-20 text-4xl font-bold">
                    <SubpackageTitle subpackage={subpackage} />
                </div>
            </PageMargins>
            <ApiPackageContents key={subpackageId} package={subpackage} slug={slug} />
        </>
    );
};
