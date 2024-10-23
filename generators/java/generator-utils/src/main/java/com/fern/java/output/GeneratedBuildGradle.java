package com.fern.java.output;

import com.fern.generator.exec.model.config.BasicLicense;
import com.fern.generator.exec.model.config.CustomLicense;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.generator.exec.model.config.LicenseConfig;
import com.fern.generator.exec.model.config.PublishingMetadata;
import com.fern.java.output.gradle.AbstractGradleDependency;
import com.fern.java.output.gradle.GradlePlugin;
import com.fern.java.output.gradle.GradlePublishingConfig;
import com.fern.java.output.gradle.GradleRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
public abstract class GeneratedBuildGradle extends GeneratedFile {

    public static final String MAVEN_USERNAME_ENV_VAR = "MAVEN_USERNAME";
    public static final String MAVEN_PASSWORD_ENV_VAR = "MAVEN_PASSWORD";
    public static final String MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR = "MAVEN_PUBLISH_REGISTRY_URL";
    public static final String JAVA_LIBRARY_PLUGIN_ID = "java-library";
    public static final String MAVEN_PUBLISH_PLUGIN_ID = "maven-publish";

    public static final String MAVEN_SIGNING_KEY_ID = "MAVEN_SIGNATURE_KID";

    public static final String MAVEN_SIGNING_KEY = "MAVEN_SIGNATURE_SECRET_KEY";

    public static final String MAVEN_SIGNING_PASSWORD = "MAVEN_SIGNATURE_PASSWORD";

    public abstract Optional<GeneratorConfig> generatorConfig();

    public abstract Boolean shouldSignPackage();

    public abstract List<GradlePlugin> plugins();

    public abstract List<String> customBlocks();

    public abstract List<GradleRepository> customRepositories();

    public abstract List<AbstractGradleDependency> dependencies();

    public abstract Optional<GradlePublishingConfig> gradlePublishingConfig();

    @Override
    public final String filename() {
        return "build.gradle";
    }

    public final String getContents() {
        RawFileWriter writer = new RawFileWriter();
        if (!plugins().isEmpty()) {
            writer.beginControlFlow("plugins");
            for (GradlePlugin gradlePlugin : plugins()) {
                String pluginLine = "id '" + gradlePlugin.pluginId() + "'";
                if (gradlePlugin.version().isPresent()) {
                    pluginLine += " version '" + gradlePlugin.version().get() + "'";
                }
                writer.addLine(pluginLine);
            }
            writer.endControlFlow();
        }
        writer.addNewLine();

        // add repositories
        writer.beginControlFlow("repositories");
        writer.addLine("mavenCentral()");
        for (GradleRepository gradleRepository : customRepositories()) {
            writer.beginControlFlow("maven");
            writer.addLine("url '" + gradleRepository.url() + "'");
            writer.endControlFlow();
        }
        writer.endControlFlow();
        writer.addNewLine();

        // add dependencies
        writer.beginControlFlow("dependencies");
        for (AbstractGradleDependency gradleDependency : dependencies()) {
            writer.addLine(gradleDependency.toString());
        }
        writer.endControlFlow();
        writer.addNewLine();

        writer.addNewLine();
        writer.addLine("sourceCompatibility = 1.8");
        writer.addLine("targetCompatibility = 1.8");
        writer.addNewLine();

        customBlocks().forEach(writer::addLine);

        // add publishing
        if (gradlePublishingConfig().isPresent()) {
            writer.beginControlFlow("publishing");

            writer.beginControlFlow("publications");
            writer.beginControlFlow("maven(MavenPublication)");
            writer.addLine("groupId = '" + gradlePublishingConfig().get().group() + "'");
            writer.addLine("artifactId = '" + gradlePublishingConfig().get().artifact() + "'");
            writer.addLine("version = '" + gradlePublishingConfig().get().version() + "'");
            writer.addLine("from components.java");

            writePomPublishConfiguration(writer);

            writer.endControlFlow();
            writer.endControlFlow();

            writer.beginControlFlow("repositories");
            writer.beginControlFlow("maven");
            writer.addLine("url \"$System.env." + MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR + "\"");
            writer.beginControlFlow("credentials");
            writer.addLine("username \"$System.env." + MAVEN_USERNAME_ENV_VAR + "\"");
            writer.addLine("password \"$System.env." + MAVEN_PASSWORD_ENV_VAR + "\"");
            writer.endControlFlow();
            writer.endControlFlow();
            writer.endControlFlow();

            writer.endControlFlow();
            writer.addNewLine();
        }
        return writer.getContents();
    }

    private void writePomPublishConfiguration(RawFileWriter writer) {
        if (!generatorConfig().isPresent()) {
            return;
        }
        GeneratorConfig config = generatorConfig().get();

        Optional<String> license = config.getLicense()
                .map(licenseConfig -> licenseConfig.visit(new LicenseConfig.Visitor<String>() {
                    @Override
                    public String visitBasic(BasicLicense basicLicense) {
                        return basicLicense.getId().toString();
                    }

                    @Override
                    public String visitCustom(CustomLicense customLicense) {
                        return customLicense.toString();
                    }

                    @Override
                    public String visitUnknown(String s) {
                        return null;
                    }
                }));

        Optional<PublishingMetadata> pm = config.getOutput().getPublishingMetadata();
        String organizationName = config.getOrganization();
        String githubUrl = config.getOutput()
                .getMode()
                .getGithub()
                .map(GithubOutputMode::getRepoUrl)
                .orElseGet(() -> "https://github.com/YOUR-ORG/YOUR-REPO");

        writer.beginControlFlow("pom");
        if (pm.isPresent() && pm.get().getPublisherName().isPresent() || shouldSignPackage()) {
            writer.addLine("name = '"
                    + pm.flatMap(PublishingMetadata::getPublisherName).orElseGet(() -> organizationName) + "'");
        }
        if (pm.isPresent() && pm.get().getPackageDescription().isPresent() || shouldSignPackage()) {
            writer.addLine("description = '"
                    + pm.flatMap(PublishingMetadata::getPackageDescription)
                            .orElseGet(() -> "The official SDK of " + organizationName)
                    + "'");
        }
        if (pm.isPresent() && pm.get().getReferenceUrl().isPresent() || shouldSignPackage()) {
            writer.addLine("url = '"
                    + pm.flatMap(PublishingMetadata::getReferenceUrl).orElseGet(() -> "https://buildwithfern.com")
                    + "'");
        }

        if (license.isPresent()) {
            writer.beginControlFlow("licenses");
            writer.beginControlFlow("license");
            writer.addLine("name = '" + license.get() + "'");
            writer.endControlFlow();
            writer.endControlFlow();
        }

        if (pm.isPresent()
                        && (pm.get().getPublisherName().isPresent()
                                || pm.get().getPublisherEmail().isPresent())
                || shouldSignPackage()) {
            writer.beginControlFlow("developers");
            writer.beginControlFlow("developer");
            writer.addLine("name = '"
                    + pm.flatMap(PublishingMetadata::getPublisherName).orElseGet(() -> organizationName) + "'");
            writer.addLine("email = '"
                    + pm.flatMap(PublishingMetadata::getPublisherEmail)
                            .orElseGet(() -> "developers@" + organizationName + ".com")
                    + "'");
            writer.endControlFlow();
            writer.endControlFlow();
        }

        writer.beginControlFlow("scm");
        writer.addLine("connection = 'scm:git:git://" + githubUrl.replace("https://", "") + ".git'");
        writer.addLine("developerConnection = 'scm:git:git://" + githubUrl.replace("https://", "") + ".git'");
        writer.addLine("url = '" + githubUrl + "'");
        writer.endControlFlow();

        writer.endControlFlow();
    }

    public final void writeToFile(Path directory, boolean _isLocal, Optional<String> _existingPrefix)
            throws IOException {
        Files.writeString(directory.resolve("build.gradle"), getContents());
    }

    public static ImmutableGeneratedBuildGradle.Builder builder() {
        return ImmutableGeneratedBuildGradle.builder();
    }
}
