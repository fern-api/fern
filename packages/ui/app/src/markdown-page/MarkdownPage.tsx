import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { Markdown } from "../api-components/markdown/Markdown";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace MarkdownPage {
    export interface Props {
        page: FernRegistryDocsRead.PageMetadata;
    }
}

export const MarkdownPage: React.FC<MarkdownPage.Props> = ({ pageId }) => {
    const { resolvePage } = useDocsContext();
    return (
        <div className="flex flex-col items-center overflow-y-auto pb-10">
            <div className="w-[700px]">
                <Markdown>{resolvePage(pageId).markdown}</Markdown>
            </div>
        </div>
    );
};
