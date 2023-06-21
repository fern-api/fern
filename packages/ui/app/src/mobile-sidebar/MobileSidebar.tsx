import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { assertNever } from "@fern-api/core-utils";
import { useBooleanState } from "@fern-api/react-commons";
import { useMemo } from "react";
import { ApiArtifactsTitle } from "../api-page/artifacts/ApiArtifactsTitle";
import { EndpointTitle } from "../api-page/endpoints/EndpointTitle";
import { SubpackageTitle } from "../api-page/subpackages/SubpackageTitle";
import { useDocsContext } from "../docs-context/useDocsContext";
import { Sidebar } from "../sidebar/Sidebar";

export const MobileSidebar: React.FC = () => {
    const { selectedPath } = useDocsContext();
    const { value: isOpen, setTrue: open, setFalse: close } = useBooleanState(false);

    const title = useMemo(() => {
        if (selectedPath == null) {
            return undefined;
        }
        switch (selectedPath.type) {
            case "api":
                return selectedPath.apiSection.title;
            case "apiSubpackage":
                return <SubpackageTitle subpackage={selectedPath.subpackage} />;
            case "endpoint":
            case "topLevelEndpoint":
                return <EndpointTitle endpoint={selectedPath.endpoint} />;
            case "page":
                return selectedPath.page.title;
            case "clientLibraries":
                return <ApiArtifactsTitle />;
            case "section":
                return selectedPath.section.title;
            default:
                assertNever(selectedPath);
        }
    }, [selectedPath]);

    return (
        <>
            <div className="text-text-default flex flex-1 items-center gap-3 pb-1 pl-4 pr-2" onClick={open}>
                <div>{title}</div>
                <Icon icon={IconNames.CHEVRON_DOWN} />
            </div>
            {isOpen && (
                <>
                    <div className="absolute inset-0 z-10 backdrop-blur-xl" onClick={close}>
                        <Sidebar expandAllSections />
                    </div>
                    <Icon className="absolute right-5 top-5 z-10" icon={IconNames.CROSS} onClick={close} />
                </>
            )}
        </>
    );
};
