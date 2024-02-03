/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.fern.java.generators;

import com.fern.java.output.RawGeneratedFile;
import java.util.Optional;

public final class GithubWorkflowGenerator {

    private GithubWorkflowGenerator() {}

    public static RawGeneratedFile getGithubWorkflow(Optional<String> registryUrl) {
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
            contents += getPublishWorkflow(registryUrl.get());
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

    public static String getPublishWorkflow(String registryUrl) {
        return "  publish:\n"
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
                + "        run: |\n"
                + "          ./gradlew  publish\n"
                + "        env:\n"
                + "          MAVEN_USERNAME: ${{ secrets.MAVEN_USERNAME }}\n"
                + "          MAVEN_PASSWORD: ${{ secrets.MAVEN_PASSWORD }}\n"
                + "          MAVEN_PUBLISH_REGISTRY_URL: \"" + registryUrl + "\"";
    }
}
