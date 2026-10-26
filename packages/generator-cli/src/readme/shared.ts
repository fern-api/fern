import { camelCase, upperFirst } from "es-toolkit/string";
import { FernGeneratorCli } from "../configuration/sdk/index.js";
import type { Writer } from "../utils/Writer.js";

export async function writeInstallation({
    writer,
    language
}: {
    writer: Writer;
    language: FernGeneratorCli.LanguageInfo;
}): Promise<void> {
    if (language.publishInfo == null) {
        // This should be unreachable.
        throw new Error("publish information is required for installation block");
    }
    switch (language.type) {
        case "typescript":
            await writeInstallationForNPM({ writer, npm: language.publishInfo });
            break;
        case "python":
            await writeInstallationForPyPi({ writer, pypi: language.publishInfo });
            break;
        case "java":
            await writeInstallationForMaven({ writer, maven: language.publishInfo });
            break;
        case "go":
            await writeInstallationForGo({ writer, go: language.publishInfo });
            break;
        case "ruby":
            await writeInstallationForRubyGems({ writer, rubyGems: language.publishInfo });
            break;
        case "csharp":
            await writeInstallationForNuget({ writer, nuget: language.publishInfo });
            break;
        case "php":
            await writeInstallationForComposer({ writer, composer: language.publishInfo });
            break;
        case "rust":
            await writeInstallationForCargo({ writer, cargo: language.publishInfo });
            break;
        case "swift":
            await writeInstallationForSwiftPackageManager({ writer, spm: language.publishInfo });
            break;
        default:
            assertNever(language);
    }
}

export function getPackageName(language: FernGeneratorCli.LanguageInfo): string | undefined {
    switch (language.type) {
        case "typescript":
            return language.publishInfo?.packageName;
        case "python":
            return language.publishInfo?.packageName;
        case "java":
            return language.publishInfo != null
                ? `${language.publishInfo.group}:${language.publishInfo.artifact}`
                : undefined;
        case "go":
            return language.publishInfo != null
                ? `github.com/${language.publishInfo.owner}/${language.publishInfo.repo}`
                : undefined;
        case "ruby":
            return language.publishInfo?.packageName;
        case "csharp":
            return language.publishInfo?.packageName;
        case "php":
            return language.publishInfo?.packageName;
        case "rust":
            return language.publishInfo != null
                ? getCrateNameFromPackageName(language.publishInfo.packageName)
                : undefined;
        case "swift":
            return language.publishInfo?.gitUrl;
        default:
            assertNever(language);
    }
}

async function writeInstallationForNPM({
    writer,
    npm
}: {
    writer: Writer;
    npm: FernGeneratorCli.NpmPublishInfo;
}): Promise<void> {
    await writer.writeLine("```sh");
    await writer.writeLine(`npm i -s ${npm.packageName}`);
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForPyPi({
    writer,
    pypi
}: {
    writer: Writer;
    pypi: FernGeneratorCli.PypiPublishInfo;
}): Promise<void> {
    await writer.writeLine("```sh");
    await writer.writeLine(`pip install ${pypi.packageName}`);
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForMaven({
    writer,
    maven
}: {
    writer: Writer;
    maven: FernGeneratorCli.MavenPublishInfo;
}): Promise<void> {
    await writer.writeLine("### Gradle");
    await writer.writeLine();
    await writer.writeLine("Add the dependency in your `build.gradle` file:");
    await writer.writeLine();
    await writer.writeLine("```groovy");
    await writer.writeLine("dependencies {");
    await writer.writeLine(`  implementation '${maven.group}:${maven.artifact}:${maven.version}'`);
    await writer.writeLine("}");
    await writer.writeLine("```");
    await writer.writeLine();

    await writer.writeLine("### Maven");
    await writer.writeLine();
    await writer.writeLine("Add the dependency in your `pom.xml` file:");
    await writer.writeLine();
    await writer.writeLine("```xml");
    await writer.writeLine("<dependency>");
    await writer.writeLine(`  <groupId>${maven.group}</groupId>`);
    await writer.writeLine(`  <artifactId>${maven.artifact}</artifactId>`);
    await writer.writeLine(`  <version>${maven.version}</version>`);
    await writer.writeLine("</dependency>");
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForGo({
    writer,
    go
}: {
    writer: Writer;
    go: FernGeneratorCli.GoPublishInfo;
}): Promise<void> {
    await writer.writeLine("```sh");
    await writer.write(`go get github.com/${go.owner}/${go.repo}`);
    const majorVersion = getMajorVersion(go.version);
    if (!majorVersion.startsWith("0") && !majorVersion.startsWith("1")) {
        // For Go, we need to append the major version to the module path for any release greater than v1.X.X.
        await writer.write(`/v${majorVersion}`);
    }
    await writer.writeLine();
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForRubyGems({
    writer,
    rubyGems
}: {
    writer: Writer;
    rubyGems: FernGeneratorCli.RubyGemsPublishInfo;
}): Promise<void> {
    await writer.writeLine("```sh");
    await writer.writeLine(`gem install ${rubyGems.packageName}`);
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForNuget({
    writer,
    nuget
}: {
    writer: Writer;
    nuget: FernGeneratorCli.NugetPublishInfo;
}): Promise<void> {
    await writer.writeLine("```sh");
    await writer.writeLine(`dotnet add package ${nuget.packageName}`);
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForComposer({
    writer,
    composer
}: {
    writer: Writer;
    composer: FernGeneratorCli.ComposerPublishInfo;
}): Promise<void> {
    await writer.writeLine("```sh");
    await writer.writeLine(`composer require ${composer.packageName}`);
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForCargo({
    writer,
    cargo
}: {
    writer: Writer;
    cargo: FernGeneratorCli.CargoPublishInfo;
}): Promise<void> {
    await writer.writeLine("Add this to your `Cargo.toml`:");
    await writer.writeLine();
    await writer.writeLine("```toml");
    await writer.writeLine("[dependencies]");
    await writer.writeLine(`${getCrateNameFromPackageName(cargo.packageName)} = "${cargo.version}"`);
    await writer.writeLine("```");
    await writer.writeLine();
    await writer.writeLine("Or install via cargo:");
    await writer.writeLine();
    await writer.writeLine("```sh");
    await writer.writeLine(`cargo add ${getCrateNameFromPackageName(cargo.packageName)}`);
    await writer.writeLine("```");
    await writer.writeLine();
}

async function writeInstallationForSwiftPackageManager({
    writer,
    spm
}: {
    writer: Writer;
    spm: FernGeneratorCli.SwiftPackageManagerPublishInfo;
}): Promise<void> {
    await writer.writeLine(
        "With Swift Package Manager (SPM), add the following to the top-level `dependencies` array within your `Package.swift` file:"
    );
    await writer.writeLine();
    await writer.writeLine("```swift");
    await writer.writeLine("dependencies: [");
    await writer.writeLine(`    .package(url: "${spm.gitUrl}", from: "${spm.minVersion}"),`);
    await writer.writeLine("]");
    await writer.writeLine("```");
    await writer.writeLine();
}

export function getCrateNameFromPackageName(packageName: string): string {
    return packageName.includes("/") ? (packageName.split("/").pop() ?? packageName) : packageName;
}

export function languageToTitle(language: FernGeneratorCli.LanguageInfo): string {
    switch (language.type) {
        case "typescript":
            return "TypeScript";
        case "python":
            return "Python";
        case "go":
            return "Go";
        case "java":
            return "Java";
        case "ruby":
            return "Ruby";
        case "csharp":
            return "C#";
        case "php":
            return "PHP";
        case "rust":
            return "Rust";
        case "swift":
            return "Swift";
        default:
            assertNever(language);
    }
}

export function featureIDToTitle(featureID: string): string {
    const words = featureID.split("_").map((s) => pascalCase(s));

    const lowercaseWords = new Set([
        "And",
        "Or",
        "Nor",
        "But",
        "For",
        "Yet",
        "So",
        "At",
        "By",
        "In",
        "Of",
        "On",
        "To",
        "As"
    ]);

    return words
        .map((word, index) => {
            if (index === 0 || index === words.length - 1) {
                return word;
            }
            if (lowercaseWords.has(word)) {
                return word.toLowerCase();
            }
            return word;
        })
        .join(" ");
}

export function pascalCase(s: string): string {
    return upperFirst(camelCase(s));
}

function getMajorVersion(version: string): string {
    return version.split(".")[0] ?? "0";
}

export function assertNever(x: never): never {
    throw new Error(`unexpected value: ${JSON.stringify(x)}`);
}
