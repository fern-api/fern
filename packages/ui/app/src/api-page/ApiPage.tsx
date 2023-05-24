import { useState } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { PageMargins } from "../page-margins/PageMargins";
import { ApiPageContextProvider } from "./api-page-context/ApiPageContextProvider";
import { ApiPackageContents } from "./ApiPackageContents";

export const ApiPage: React.FC = () => {
    const { apiDefinition, apiSlug } = useApiDefinitionContext();

    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    return (
        <ApiPageContextProvider containerRef={containerRef ?? undefined}>
            <div ref={setContainerRef} className="min-h-0 overflow-y-auto pb-36">
                <ApiPackageContents package={apiDefinition.rootPackage} slug={apiSlug} />
                <PageMargins>
                    <BottomNavigationButtons />
                </PageMargins>
            </div>
        </ApiPageContextProvider>
    );
};
