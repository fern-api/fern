import { H1 } from "@blueprintjs/core";
import { useMemo } from "react";
import { Markdown } from "../api-page/markdown/Markdown";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { useDocsContext } from "../docs-context/useDocsContext";
import { TableOfContents } from "./TableOfContents";

export declare namespace MarkdownPage {
    export interface Props {
        path: ResolvedUrlPath.Page;
    }
}

export const MarkdownPage: React.FC<MarkdownPage.Props> = ({ path }) => {
    const { resolvePage } = useDocsContext();

    const page = useMemo(() => resolvePage(path.page.id), [path.page.id, resolvePage]);

    return (
        <div className="flex overflow-y-auto gap-20 px-20">
            <div className="flex flex-col max-w-screen-md">
                <H1 className="mb-10">{path.page.title}</H1>
                <Markdown>{page.markdown}</Markdown>
                <BottomNavigationButtons />
            </div>
            <div className="sticky top-0 shrink-0">
                <TableOfContents markdown={page.markdown} />
            </div>
        </div>
    );
};
