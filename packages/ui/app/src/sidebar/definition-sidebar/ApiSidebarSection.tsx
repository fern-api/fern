import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useDocsContext } from "../../docs-context/useDocsContext";
import { ApiPackageSidebarSection } from "./ApiPackageSidebarSection";
import { TopLevelEndpointSidebarItem } from "./TopLevelEndpointSidebarItem";

export declare namespace ApiSidebarSection {
    export interface Props {
        apiSection: FernRegistryDocsRead.ApiSection;
    }
}

export const ApiSidebarSection: React.FC<ApiSidebarSection.Props> = ({ apiSection }) => {
    const { docsDefinition } = useDocsContext();

    const api: FernRegistryApiRead.ApiDefinition = (docsDefinition as any).apis[apiSection.api];

    return (
        <>
            {api.rootPackage.endpoints.map((endpoint) => (
                <TopLevelEndpointSidebarItem key={endpoint.id} endpoint={endpoint} />
            ))}
            {api.rootPackage.subpackages.map((subpackageId) => (
                <ApiPackageSidebarSection key={subpackageId} subpackageId={subpackageId} />
            ))}
        </>
    );
};
