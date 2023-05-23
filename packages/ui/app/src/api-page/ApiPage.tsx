import { useMemo, useState } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { ApiPageContextProvider } from "./api-page-context/ApiPageContextProvider";
import { ApiPackageContents } from "./ApiPackageContents";

export const ApiPage: React.FC = () => {
    const { apiDefinition, apiSection, apiSlug } = useApiDefinitionContext();

    const path = useMemo(
        (): ResolvedUrlPath.Api => ({
            type: "api",
            apiSection,
            slug: apiSlug,
        }),
        [apiSection, apiSlug]
    );

    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    return (
        <ApiPageContextProvider containerRef={containerRef ?? undefined}>
            <div ref={setContainerRef} className="min-h-0 overflow-y-auto pb-36">
                <ApiPackageContents package={apiDefinition.rootPackage} slug={apiSlug} path={path} />
            </div>
        </ApiPageContextProvider>
    );
};
