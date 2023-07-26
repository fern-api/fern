import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import classNames from "classnames";
import { DEFAULT_LOGO_HEIGHT } from "../config";
import { useDocsContext } from "../docs-context/useDocsContext";
import { HeaderPrimaryLink } from "./HeaderPrimaryLink";
import { HeaderSecondaryLink } from "./HeaderSecondaryLink";
import { HeaderVersionMenu } from "./HeaderVersionMenu";

export const Header: React.FC = () => {
    const { resolveFile, docsDefinition, docsInfo } = useDocsContext();
    const { logo, logoHeight, logoHref, navbarLinks } = docsDefinition.config;

    const hasMultipleVersions = docsInfo.type === "versioned";
    const hasLogo = logo != null;
    const hasLogoHref = logoHref != null;

    const logoContent = hasLogo && (
        <img
            src={resolveFile(logo)}
            className="max-h-full object-contain"
            style={{
                height: logoHeight ?? DEFAULT_LOGO_HEIGHT,
            }}
        />
    );
    const logoSection = hasLogo && (
        <div className="relative flex h-full items-center space-x-3 py-1">
            {hasLogoHref ? (
                <a href={logoHref} className="flex items-center">
                    {logoContent}
                </a>
            ) : (
                <div className="flex items-center">{logoContent}</div>
            )}
            {hasMultipleVersions && (
                <div>
                    <HeaderVersionMenu versions={docsInfo.versions} selectedId={docsInfo.activeVersion} />
                </div>
            )}
        </div>
    );

    const navbarLinksSection = (
        <div className="flex items-center space-x-5 md:space-x-8">
            {navbarLinks.map((navbarLink, idx) =>
                visitDiscriminatedUnion(navbarLink, "type")._visit({
                    primary: (navbarLink) => <HeaderPrimaryLink key={idx} navbarLink={navbarLink} />,
                    secondary: (navbarLink) => <HeaderSecondaryLink key={idx} navbarLink={navbarLink} />,
                    _other: () => null,
                })
            )}
        </div>
    );

    return (
        <div
            className={classNames(
                "flex justify-between items-center shrink-0 pl-4 pr-4",
                // this matches with the calc() in the EndpointContent examples section
                "h-16"
            )}
        >
            {logoSection}
            {navbarLinksSection}
        </div>
    );
};
