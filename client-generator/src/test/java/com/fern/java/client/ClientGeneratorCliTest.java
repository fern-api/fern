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

package com.fern.java.client;

import com.fern.java.testing.LocalTestRunner;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.junit.jupiter.api.Test;

public class ClientGeneratorCliTest {

    @Test
    public void test_baosic() throws IOException {

        Path currentPath = Paths.get("").toAbsolutePath();
        Path eteTestDirectory = currentPath.endsWith("client-generator")
                ? currentPath.resolve(Paths.get("src/eteTest"))
                : currentPath.resolve(Paths.get("client-generator/src/eteTest"));
        LocalTestRunner.test(eteTestDirectory, new ClientGeneratorCli());
    }
}
