package com.fern.model.codegen.utils;

import java.util.Set;

public final class KeyWordUtils {

    private static final Set<String> RESERVED_WORDS = Set.of("enum", "extends");

    private KeyWordUtils() {}

    public static String getKeyWordCompatibleName(String name) {
        if (isReserved(name)) {
            return "_" + name;
        }
        return name;
    }

    static boolean isReserved(String value) {
        return RESERVED_WORDS.contains(value.toLowerCase());
    }
}
