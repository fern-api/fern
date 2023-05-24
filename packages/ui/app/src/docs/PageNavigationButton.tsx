import { useCallback } from "react";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace PageNavigationButton {
    export interface Props {
        path: ResolvedUrlPath;
        text: string;
    }
}

export const PageNavigationButton: React.FC<PageNavigationButton.Props> = ({ path, text }) => {
    const { navigateToPath } = useDocsContext();

    const onClick = useCallback(() => {
        navigateToPath(path.slug);
    }, [navigateToPath, path.slug]);

    return <div onClick={onClick}>{text}</div>;
};
