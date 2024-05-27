package com.fern.java.output;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFileAttributes;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Optional;
import java.util.Set;

public class GeneratedPublishScript extends GeneratedFile {
    @Override
    public String filename() {
        return "prepare.sh";
    }

    @Override
    public Optional<String> directoryPrefix() {
        return Optional.of(".publish");
    }

    private String contents() {
        return "# Write key ring file\n" + "echo \"$MAVEN_SIGNATURE_SECRET_KEY\" > armored_key.asc\n"
                + "gpg -o publish_key.gpg --dearmor armored_key.asc\n\n"
                + "# Generate gradle.properties file\n"
                + "echo \"signing.keyId=$MAVEN_SIGNATURE_KID\" > gradle.properties\n"
                + "echo \"signing.secretKeyRingFile=publish_key.gpg\" >> gradle.properties\n"
                + "echo \"signing.password=$MAVEN_SIGNATURE_PASSWORD\" >> gradle.properties\n";
    }

    @Override
    public final void writeToFile(Path directory, boolean _isLocal, Optional<String> _existingPrefix)
            throws IOException {
        Path resolvedPath = directory.resolve(filename());
        Files.writeString(directory.resolve(filename()), contents());

        Set<PosixFilePermission> perms =
                Files.readAttributes(resolvedPath, PosixFileAttributes.class).permissions();

        perms.add(PosixFilePermission.OWNER_WRITE);
        perms.add(PosixFilePermission.OWNER_READ);
        perms.add(PosixFilePermission.OWNER_EXECUTE);
        perms.add(PosixFilePermission.GROUP_WRITE);
        perms.add(PosixFilePermission.GROUP_READ);
        perms.add(PosixFilePermission.GROUP_EXECUTE);
        perms.add(PosixFilePermission.OTHERS_EXECUTE);
        Files.setPosixFilePermissions(resolvedPath, perms);
    }

    public GeneratedPublishScript() {}
}
