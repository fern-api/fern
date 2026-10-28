import path from "path";

export function getSdkGenApiPreviewOutputDirectoryName(generatorName: string, sdkConfigTargetIndex?: number): string {
    const baseName = path.basename(generatorName);
    return sdkConfigTargetIndex == null ? baseName : `${baseName}-${sdkConfigTargetIndex}`;
}
