import { H1 } from "@blueprintjs/core";
import { Markdown } from "../api-page/markdown/Markdown";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace MarkdownPage {
    export interface Props {
        path: ResolvedUrlPath.Page;
    }
}

export const MarkdownPage: React.FC<MarkdownPage.Props> = ({ path }) => {
    const { resolvePage } = useDocsContext();

    return (
        <div className="flex flex-col overflow-y-auto pb-10">
            <H1 className="mb-10">{path.page.title}</H1>
            <Markdown>{resolvePage(path.page.id).markdown}</Markdown>
            <BottomNavigationButtons />
        </div>
    );
};
