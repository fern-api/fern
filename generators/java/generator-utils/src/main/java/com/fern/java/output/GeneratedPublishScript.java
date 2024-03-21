package com.fern.java.output;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class GeneratedPublishScript {
    private static final RawGeneratedFile GENERATED_FILE = RawGeneratedFile.builder()
            .filename("prepare.sh")
            .contents("# Write key ring file\n" +
                    "echo $MAVEN_SIGNATURE_SECRET_KEY > armored_key.asc\n" +
                    "gpg -o publish_key.gpg --dearmor armored_key.asc\n\n" +
                    "# Generate gradle.properties file\n" +
                    "echo \"signing.keyId=$MAVEN_SIGNATURE_KID\" > gradle.properties\n" +
                    "echo \"signing.secretKeyRingFile=publish_key.gpg\" >> gradle.properties\n" +
                    "echo \"signing.password=$MAVEN_SIGNATURE_PASSWORD\" >> gradle.properties\n")
            .directoryPrefix(".publish")
            .build();

    private GeneratedPublishScript() {}

    public static RawGeneratedFile getGeneratedFile() {
        return GENERATED_FILE;
    }
}
