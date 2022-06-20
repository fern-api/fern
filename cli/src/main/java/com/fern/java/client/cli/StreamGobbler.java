package com.fern.java.client.cli;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public final class StreamGobbler extends Thread {
    private final InputStream is;

    StreamGobbler(InputStream is) {
        this.is = is;
    }

    @SuppressWarnings("BanSystemOut")
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
