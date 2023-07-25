import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import classNames from "classnames";
import { ChevronRightIcon } from "../commons/icons/ChevronRightIcon";

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: FernRegistryDocsRead.NavbarLink.Primary;
    }
}

export const HeaderPrimaryLink: React.FC<HeaderPrimaryLink.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames(
                "group pl-4 pr-2.5 py-1.5 flex space-x-1.5 items-center !no-underline !text-accentPrimary transition rounded-full border border-accentPrimary/40 hover:border-accentPrimary bg-accentHighlight hover:bg-accentHighlight/20"
            )}
            href={navbarLink.url}
            rel="noreferrer noopener"
        >
            <span className="whitespace-nowrap">{navbarLink.text}</span>
            <div className="flex h-4 w-4 items-center">
                <ChevronRightIcon className="h-3 w-3 transition group-hover:translate-x-1 group-hover:scale-125" />
            </div>
        </a>
    );
};
