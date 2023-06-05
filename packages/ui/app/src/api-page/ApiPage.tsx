import { useState } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { Page } from "../page/Page";
import { PageMargins } from "../page/PageMargins";
import { ApiPageContextProvider } from "./api-page-context/ApiPageContextProvider";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export const ApiPage: React.FC = () => {
    const { apiDefinition, apiSlug, apiSection } = useApiDefinitionContext();

    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    return (
        <ApiPageContextProvider containerRef={containerRef ?? undefined}>
            <Page ref={setContainerRef} className="min-h-0 flex-col pb-36 pt-20">
                <PageMargins>
                    <div className="mt-20 pb-2 text-4xl font-medium">{apiSection.title}</div>
                </PageMargins>
                {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                    <ApiArtifacts apiArtifacts={apiSection.artifacts} />
                )}
                <ApiPackageContents package={apiDefinition.rootPackage} slug={apiSlug} />
                <PageMargins>
                    <BottomNavigationButtons />
                </PageMargins>
            </Page>
        </ApiPageContextProvider>
    );
};
