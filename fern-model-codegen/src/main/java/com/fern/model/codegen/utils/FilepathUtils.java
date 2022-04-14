package com.fern.model.codegen.utils;

import com.fern.model.codegen.config.PluginConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public final class FilepathUtils {

    private final List<String> packagePrefixes;

    public FilepathUtils(PluginConfig pluginConfig) {
        String[] splitPackagePrefix = pluginConfig
                .packagePrefix()
                .map(packagePrefix -> packagePrefix.split("/"))
                .orElseGet(() -> new String[0]);
        this.packagePrefixes = Arrays.asList(splitPackagePrefix);
    }

    public String convertFilepathToPackage(String filepath) {
        String filepathWithoutExtension = filepath.substring(0, filepath.lastIndexOf("."));
        List<String> splitFilepath = Arrays.asList(filepathWithoutExtension.split("/"));
        List<String> packagePath = new ArrayList<>(packagePrefixes);
        packagePath.addAll(splitFilepath);
        return String.join(".", packagePath);
    }
}
