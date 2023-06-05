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
        <div className="flex justify-center gap-20 overflow-y-auto px-20 pt-20">
            <div className="w-[750px]">
                <H1 className="mb-10">{path.page.title}</H1>
                <Markdown>{page.markdown}</Markdown>
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>
            <div className="sticky top-0 w-64 shrink-0">
                <TableOfContents markdown={page.markdown} />
            </div>
        </div>
    );
};
