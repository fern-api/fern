import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class GradleGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    public async generate(): Promise<void> {
        this.context.logger.info("Generating Gradle build files...");

        await this.generateBuildGradle();
        await this.generateSettingsGradle();
        await this.generateGradleProperties();
    }

    private async generateBuildGradle(): Promise<void> {
        const groupId = this.context.getGroupId();
        const artifactId = this.context.getArtifactId();
        const version = this.context.getVersion();

        const buildGradle = `plugins {
    kotlin("jvm") version "1.9.0"
    kotlin("plugin.serialization") version "1.9.0"
    id("maven-publish")
}

group = "${groupId}"
version = "${version}"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    implementation("io.ktor:ktor-client-core:2.3.5")
    implementation("io.ktor:ktor-client-cio:2.3.5")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.5")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.5")
    
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(11)
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = "${groupId}"
            artifactId = "${artifactId}"
            version = "${version}"
            
            from(components["java"])
        }
    }
}
`;

        const filePath = join(this.context.config.output.path, RelativeFilePath.of("build.gradle.kts"));
        const directory = path.dirname(filePath);
        await mkdir(directory, { recursive: true });
        await writeFile(filePath, buildGradle);
    }

    private async generateSettingsGradle(): Promise<void> {
        const artifactId = this.context.getArtifactId();

        const settingsGradle = `rootProject.name = "${artifactId}"
`;

        const filePath = join(this.context.config.output.path, RelativeFilePath.of("settings.gradle.kts"));
        await writeFile(filePath, settingsGradle);
    }

    private async generateGradleProperties(): Promise<void> {
        const gradleProperties = `kotlin.code.style=official
`;

        const filePath = join(this.context.config.output.path, RelativeFilePath.of("gradle.properties"));
        await writeFile(filePath, gradleProperties);
    }
}
