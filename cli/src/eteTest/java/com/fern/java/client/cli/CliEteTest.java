package com.fern.java.client.cli;

import au.com.origin.snapshots.Expect;
import au.com.origin.snapshots.annotations.SnapshotName;
import au.com.origin.snapshots.junit5.SnapshotExtension;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SnapshotExtension.class)
public class CliEteTest {

    private Expect expect;

    @SnapshotName("basic")
    @Test
    public void test_basic() throws IOException {
        fernGenerate("src/eteTest/basic");
        Files.walk(Paths.get( "src/eteTest/basic/api/generated-java")).forEach(path -> {
            if (path.toFile().isDirectory()) {
                return;
            }
            try {
                String fileContents = Files.readString(path);
                expect.scenario(path.toString()).toMatchSnapshot(fileContents);
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file: " + path);
            }
        });
    }

    private static void fernGenerate(String workingDirectory) {
        int exitCode;
        try {
            ProcessBuilder pb = new ProcessBuilder(new String[]{"fern", "generate"})
                    .directory(new File(workingDirectory));

            Map<String, String> env = pb.environment();
            env.put("NODE_ENV", "development");

            Process process = pb.start();
            StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream());
            StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream());
            errorGobbler.start();
            outputGobbler.start();
            exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Failed to run fern generate!");
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to run fern generate!", e);
        }
    }

    private static class StreamGobbler extends Thread {
        InputStream is;

        StreamGobbler(InputStream is) {
            this.is = is;
        }

        public void run() {
            try {
                InputStreamReader isr = new InputStreamReader(is);
                BufferedReader br = new BufferedReader(isr);
                String line = null;
                while ((line = br.readLine()) != null) {
                    System.out.println(line);
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to print command output", e);
            }
        }
    }
}
