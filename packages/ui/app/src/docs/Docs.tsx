import { MaybeLoadedDocs } from "./MaybeLoadedDocs";
import { useCurrentUrl } from "./useCurrentUrl";

export declare namespace Docs {
    export interface Props {
        url: string;
        pathname: string;
    }
}

export const Docs: React.FC<Docs.Props> = ({ url: windowUrl, pathname }) => {
    const url = useCurrentUrl({ windowUrl });
    return <MaybeLoadedDocs url={url} pathname={pathname} />;
};
