import { docsYml } from "@fern-api/configuration";
import { stripLeadingSlash } from "@fern-api/core-utils";
import { FernDocsBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, dirname, join } from "@fern-api/fs-utils";

import { MintJsonSchema } from "./mintlify";

const LOGO_DEFAULT_HEIGHT = 28; // mintlify's default height (1.75rem);

export declare namespace convertLogo {
    interface Args {
        absolutePathToMintJson: AbsoluteFilePath;
        logo: MintJsonSchema["logo"];
        builder: FernDocsBuilder;
    }
}

export function convertLogo({
    logo,
    builder,
    absolutePathToMintJson
}: convertLogo.Args): docsYml.RawSchemas.LogoConfiguration | undefined {
    if (logo == null) {
        return undefined;
    }

    if (typeof logo === "string") {
        const relativeFilepath = RelativeFilePath.of(stripLeadingSlash(logo));
        builder.addAsset({
            absoluteFilePathToAsset: join(dirname(absolutePathToMintJson), relativeFilepath),
            relativeFilePathFromDocsYml: relativeFilepath
        });
        return {
            light: relativeFilepath,
            dark: relativeFilepath,
            height: LOGO_DEFAULT_HEIGHT
        };
    }

    const relativeFilepathToLight = RelativeFilePath.of(stripLeadingSlash(logo.light));
    builder.addAsset({
        absoluteFilePathToAsset: join(dirname(absolutePathToMintJson), relativeFilepathToLight),
        relativeFilePathFromDocsYml: relativeFilepathToLight
    });
    const relativeFilepathToDark = RelativeFilePath.of(stripLeadingSlash(logo.dark));
    builder.addAsset({
        absoluteFilePathToAsset: join(dirname(absolutePathToMintJson), relativeFilepathToDark),
        relativeFilePathFromDocsYml: relativeFilepathToDark
    });
    return {
        light: relativeFilepathToLight,
        dark: relativeFilepathToDark,
        href: logo.href,
        height: LOGO_DEFAULT_HEIGHT
    };
}
