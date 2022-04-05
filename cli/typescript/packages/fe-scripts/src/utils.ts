import { LernaPackage, PackageName } from "./types";

export function getPackagesByName(packages: LernaPackage[]): Record<PackageName, LernaPackage | undefined> {
    return packages.reduce<Record<PackageName, LernaPackage | undefined>>((acc, p) => ({ ...acc, [p.name]: p }), {});
}

export function isBundle(packageName: string): boolean {
    return packageName.endsWith("-fe-bundle");
}
