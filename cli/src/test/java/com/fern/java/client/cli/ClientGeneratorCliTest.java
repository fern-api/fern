package com.fern.java.client.cli;

import org.junit.jupiter.api.Test;

public class ClientGeneratorCliTest {

    @Test
    public void test_basic() {
        ClientGeneratorCli.main(
                "fern-client-cli/src/test/resources/ir.json", "fern-ir-test", "com.fern");
    }
}
