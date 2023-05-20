import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { Markdown } from "../api-page/definition/markdown/Markdown";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace MarkdownPage {
    export interface Props {
        page: FernRegistryDocsRead.PageMetadata;
    }
}

export const MarkdownPage: React.FC<MarkdownPage.Props> = ({ page }) => {
    const { resolvePage } = useDocsContext();
    return (
        <div>
            <Markdown>{resolvePage(page.id).markdown}</Markdown>
        </div>
    );
};
