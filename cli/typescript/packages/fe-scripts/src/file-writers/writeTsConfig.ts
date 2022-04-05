import path from "path";
import { CompilerOptions, ProjectReference } from "typescript";
import { createOverridablePackageValueSupplierWithArgument } from "../OverridablePackageValue";
import { FileWriterArgs } from "./utils/createFileWriter";
import { createJsonFileWriter } from "./utils/createJsonFileWriter";
import { getPathToShared } from "./utils/getPathToShared";

export const writeTsConfig = createJsonFileWriter({
    relativePath: "tsconfig.json",
    isForBundlesOnly: false,
    generateJson: createOverridablePackageValueSupplierWithArgument({
        getDefaultValue: generateTsConfig,
    }),
});

export type TsConfig = {
    extends?: string;
    compilerOptions?: CompilerOptions;
    include?: string[];
    references: ProjectReference[];
};

function generateTsConfig({ lernaPackage, allPackages }: FileWriterArgs): TsConfig {
    const pathToShared = getPathToShared(lernaPackage);
    return {
        extends: path.join(pathToShared, "tsconfig.shared.json"),
        compilerOptions: {
            composite: true,
            outDir: "./lib",
            rootDir: "src",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            module: "CommonJS" as any,
        },
        include: ["./src"],
        references: Object.keys(lernaPackage.dependencies ?? {})
            .map((dependency) => {
                const packageOfDependency = allPackages[dependency];
                if (packageOfDependency == null) {
                    return undefined;
                }
                return path.relative(lernaPackage.location, packageOfDependency.location);
            })
            .filter(isNonNullish)
            .sort()
            .map((path) => ({ path })),
    };
}

function isNonNullish<T>(val: T | null | undefined): val is T {
    return val != null;
}
