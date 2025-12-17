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
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Value.Immutable
public abstract class GeneratedBuildGradle extends GeneratedFile {

    private static final Logger log = LoggerFactory.getLogger(GeneratedBuildGradle.class);

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

    /**
     * When true, skip generating the repositories block in build.gradle.
     * This is required when using central dependency management with
     * RepositoriesMode.FAIL_ON_PROJECT_REPOS in settings.gradle.
     */
    @Value.Default
    public Boolean skipRepositories() {
        return false;
    }

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

        // add repositories (skip if central dependency management is enabled)
        if (!skipRepositories()) {
            writer.beginControlFlow("repositories");
            writer.addLine("mavenCentral()");
            for (GradleRepository gradleRepository : customRepositories()) {
                writer.beginControlFlow("maven");
                writer.addLine("url '" + gradleRepository.url() + "'");
                writer.endControlFlow();
            }
            writer.endControlFlow();
            writer.addNewLine();
        }

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

        customBlocks().forEach((block) -> {
            writer.addLine((block));
            writer.addNewLine();
        });

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

            if (!shouldSignPackage()) {
                writer.beginControlFlow("repositories");
                writer.beginControlFlow("maven");
                writer.addLine("url \"$System.env." + MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR + "\"");
                writer.beginControlFlow("credentials");
                writer.addLine("username \"$System.env." + MAVEN_USERNAME_ENV_VAR + "\"");
                writer.addLine("password \"$System.env." + MAVEN_PASSWORD_ENV_VAR + "\"");
                writer.endControlFlow();
                writer.endControlFlow();
                writer.endControlFlow();
            }
            writer.endControlFlow();
            writer.addNewLine();

            if (shouldSignPackage()) {
                writer.beginControlFlow("sonatypeCentralUpload");
                writer.addLine("username = \"$System.env." + MAVEN_USERNAME_ENV_VAR + "\"");
                writer.addLine("password = \"$System.env." + MAVEN_PASSWORD_ENV_VAR + "\"");
                writer.addNewLine();
                writer.addLine("archives = files(");
                writer.addLine("    \"$buildDir/libs/"
                        + gradlePublishingConfig().get().artifact() + "-\" + version + \".jar\",");
                writer.addLine("    \"$buildDir/libs/"
                        + gradlePublishingConfig().get().artifact() + "-\" + version + \"-sources.jar\",");
                writer.addLine("    \"$buildDir/libs/"
                        + gradlePublishingConfig().get().artifact() + "-\" + version + \"-javadoc.jar\"");
                writer.addLine(")");
                writer.addNewLine();
                writer.addLine("pom = file(\"$buildDir/publications/maven/pom-default.xml\")");
                writer.addLine("signingKey = \"$System.env." + MAVEN_SIGNING_KEY + "\"");
                writer.addLine("signingKeyPassphrase = \"$System.env." + MAVEN_SIGNING_PASSWORD + "\"");
                writer.endControlFlow();
                writer.addNewLine();

                writer.beginControlFlow("signing");
                writer.addLine("def signingKeyId = \"$System.env." + MAVEN_SIGNING_KEY_ID + "\"");
                writer.addLine("def signingKey = \"$System.env." + MAVEN_SIGNING_KEY + "\"");
                writer.addLine("def signingPassword = \"$System.env." + MAVEN_SIGNING_PASSWORD + "\"");
                writer.addLine("useInMemoryPgpKeys(signingKeyId, signingKey, signingPassword)");
                writer.addLine("sign publishing.publications.maven");
                writer.endControlFlow();

                writer.addNewLine();
                writer.addLine("sonatypeCentralUpload.dependsOn build");
            }
        }
        return writer.getContents();
    }

    /**
     * Reads a license file and extracts the license name. For standard licenses (Apache, MIT, etc.), returns the SPDX
     * identifier. For custom licenses, returns the first line of the file as the license name.
     */
    private String extractLicenseFromFile(String filename) {
        try {
            Path licensePath = Paths.get(filename);

            if (!Files.exists(licensePath)) {
                // Return a descriptive name if file not found
                return "Custom License (" + licensePath.getFileName().toString() + ")";
            }

            String content = Files.readString(licensePath);
            String contentLower = content.toLowerCase();

            if (contentLower.contains("apache license") && contentLower.contains("version 2.0")) {
                return "Apache-2.0";
            } else if (contentLower.contains("mit license")) {
                return "MIT";
            } else if (contentLower.contains("bsd 3-clause")) {
                return "BSD-3-Clause";
            } else if (contentLower.contains("bsd 2-clause")) {
                return "BSD-2-Clause";
            } else if (contentLower.contains("gnu general public license") && contentLower.contains("version 3")) {
                return "GPL-3.0";
            } else if (contentLower.contains("gnu general public license") && contentLower.contains("version 2")) {
                return "GPL-2.0";
            } else if (contentLower.contains("mozilla public license") && contentLower.contains("2.0")) {
                return "MPL-2.0";
            } else if (contentLower.contains("isc license")) {
                return "ISC";
            } else {
                String firstLine = content.lines()
                        .filter(line -> !line.trim().isEmpty())
                        .findFirst()
                        .orElse("Custom License");

                firstLine = firstLine.trim().replaceAll("[.:;]+$", "").replaceAll("\\s+", " ");

                firstLine = firstLine.replace("'", "\\'");

                return firstLine;
            }
        } catch (IOException e) {
            // Return a descriptive name instead of null
            return "Custom License (" + Paths.get(filename).getFileName().toString() + ")";
        }
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

                        // First check if we have a license name passed from the CLI in custom config
                        if (generatorConfig().isPresent()
                                && generatorConfig().get().getCustomConfig().isPresent()) {
                            Object customConfig =
                                    generatorConfig().get().getCustomConfig().get();

                            // Check if customConfig is a Map (which it usually is when coming from JSON)
                            if (customConfig instanceof java.util.Map) {
                                @SuppressWarnings("unchecked")
                                java.util.Map<String, Object> configMap = (java.util.Map<String, Object>) customConfig;
                                Object licenseNameObj = configMap.get("_fernLicenseName");
                                if (licenseNameObj != null) {
                                    String licenseName = licenseNameObj.toString();
                                    return licenseName;
                                }
                            } else {
                                // Fallback to reflection for non-Map types
                                try {
                                    java.lang.reflect.Field fernLicenseNameField =
                                            customConfig.getClass().getDeclaredField("_fernLicenseName");
                                    fernLicenseNameField.setAccessible(true);
                                    Object value = fernLicenseNameField.get(customConfig);
                                    if (value instanceof String && !((String) value).isEmpty()) {
                                        return (String) value;
                                    }
                                } catch (Exception e) {
                                    // Silently fall back to file extraction
                                }
                            }
                        }

                        // Fallback to extracting from file
                        return extractLicenseFromFile(customLicense.getFilename());
                    }

                    @Override
                    public String visitUnknown(String s) {
                        return null;
                    }
                }));

        // Workaround: If license is not present but publishMetadata indicates custom license,
        // extract from description
        if (!license.isPresent()) {
            Optional<PublishingMetadata> pm = config.getOutput().getPublishingMetadata();
            if (pm.isPresent() && pm.get().getPackageDescription().isPresent()) {
                String description = pm.get().getPackageDescription().get();
                if (description.toLowerCase().contains("custom license")) {
                    // Look for LICENSE file in standard locations
                    license = Optional.of(extractLicenseFromFile("LICENSE"));
                }
            }
        }

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
        } else {
            writer.beginControlFlow("licenses");
            writer.beginControlFlow("license");
            writer.addLine("name = 'The MIT License (MIT)'");
            writer.addLine("url = 'https://mit-license.org/'");
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
