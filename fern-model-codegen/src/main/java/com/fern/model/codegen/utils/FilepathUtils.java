package com.fern.model.codegen.utils;

import com.fern.WithFilepath;

public final class FilepathUtils {

    private FilepathUtils() {
    }

    public static String convertFilepathToPackage(String filepath) {
        String packageName = filepath.replaceAll("/", ".");
        return packageName;
    }
}
