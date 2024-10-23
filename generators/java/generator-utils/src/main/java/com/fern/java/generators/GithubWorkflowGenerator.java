package com.fern.java.generators;

import com.fern.generator.exec.model.config.MavenCentralSignatureGithubInfo;
import com.fern.java.output.GeneratedBuildGradle;
import com.fern.java.output.RawGeneratedFile;
import java.util.Optional;

public final class GithubWorkflowGenerator {

    public static RawGeneratedFile getGithubWorkflow(
            Optional<String> registryUrl, Optional<MavenCentralSignatureGithubInfo> signatureGithubInfo) {
        String contents = "name: ci\n"
                + "\n"
                + "on: [push]\n"
                + "\n"
                + "jobs:\n"
                + "  compile:\n"
                + "    runs-on: ubuntu-latest\n"
                + "\n"
                + "    steps:\n"
                + "      - name: Checkout repo\n"
                + "        uses: actions/checkout@v3\n"
                + "\n"
                + "      - name: Set up Java\n"
                + "        id: setup-jre\n"
                + "        uses: actions/setup-java@v1\n"
                + "        with:\n"
                + "          java-version: \"11\"\n"
                + "          architecture: x64\n"
                + "\n"
                + "      - name: Compile\n"
                + "        run: ./gradlew compileJava\n"
                + "\n";
        contents += getTestWorkflow();
        if (registryUrl.isPresent()) {
            contents += getPublishWorkflow(registryUrl.get(), signatureGithubInfo);
        }
        return RawGeneratedFile.builder()
                .filename("ci.yml")
                .contents(contents)
                .directoryPrefix(".github/workflows")
                .build();
    }

    public static String getTestWorkflow() {
        return "  test:\n"
                + "    needs: [ compile ]\n"
                + "    runs-on: ubuntu-latest\n"
                + "    steps:\n"
                + "      - name: Checkout repo\n"
                + "        uses: actions/checkout@v3\n"
                + "\n"
                + "      - name: Set up Java\n"
                + "        id: setup-jre\n"
                + "        uses: actions/setup-java@v1\n"
                + "        with:\n"
                + "          java-version: \"11\"\n"
                + "          architecture: x64\n"
                + "\n"
                + "      - name: Test\n"
                + "        run: ./gradlew test"
                + "\n";
    }

    public static String getPublishWorkflow(
            String registryUrl, Optional<MavenCentralSignatureGithubInfo> maybeSignatureGithubInfo) {
        String content = "  publish:\n"
                + "    needs: [ compile, test ]\n"
                + "    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')\n"
                + "    runs-on: ubuntu-latest\n"
                + "\n"
                + "    steps:\n"
                + "      - name: Checkout repo\n"
                + "        uses: actions/checkout@v3\n"
                + "\n"
                + "      - name: Set up Java\n"
                + "        id: setup-jre\n"
                + "        uses: actions/setup-java@v1\n"
                + "        with:\n"
                + "          java-version: \"11\"\n"
                + "          architecture: x64\n"
                + "\n"
                + "      - name: Publish to maven\n"
                + "        run: |\n";

        if (maybeSignatureGithubInfo.isPresent()) {
            content = content + "          ./.publish/prepare.sh\n";
        }
        content = content
                + "          ./gradlew  publish\n"
                + "        env:\n"
                + "          MAVEN_USERNAME: ${{ secrets.MAVEN_USERNAME }}\n"
                + "          MAVEN_PASSWORD: ${{ secrets.MAVEN_PASSWORD }}\n"
                + "          MAVEN_PUBLISH_REGISTRY_URL: \"" + registryUrl + "\"\n";
        if (maybeSignatureGithubInfo.isPresent()) {
            content = content
                    + "          " + GeneratedBuildGradle.MAVEN_SIGNING_KEY_ID
                    + ": ${{ secrets.MAVEN_SIGNATURE_KID }}\n"
                    + "          " + GeneratedBuildGradle.MAVEN_SIGNING_KEY
                    + ": ${{ secrets.MAVEN_SIGNATURE_SECRET_KEY }}\n"
                    + "          " + GeneratedBuildGradle.MAVEN_SIGNING_PASSWORD
                    + ": ${{ secrets.MAVEN_SIGNATURE_PASSWORD }}\n";
        }
        return content;
    }

    private GithubWorkflowGenerator() {}
}
