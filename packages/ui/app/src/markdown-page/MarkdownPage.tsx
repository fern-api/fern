import { Markdown } from "../api-page/markdown/Markdown";
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
        <div className="flex flex-col items-center overflow-y-auto pb-10">
            <div className="w-[700px]">
                <Markdown>{resolvePage(path.page.id).markdown}</Markdown>
            </div>
        </div>
    );
};
