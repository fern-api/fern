import { CenteredContent } from "@fern-api/common-components";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { Markdown } from "../api-page/definition/markdown/Markdown";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace MarkdownPage {
    export interface Props {
        pageId: FernRegistryDocsRead.PageId;
    }
}

export const MarkdownPage: React.FC<MarkdownPage.Props> = ({ pageId }) => {
    const { resolvePage } = useDocsContext();
    return (
        <CenteredContent scrollable withVerticalPadding>
            <Markdown>{resolvePage(pageId).markdown}</Markdown>
        </CenteredContent>
    );
};
