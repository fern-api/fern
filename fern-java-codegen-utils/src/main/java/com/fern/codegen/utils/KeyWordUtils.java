package com.fern.codegen.utils;

import java.util.Set;

public final class KeyWordUtils {

    private static final Set<String> RESERVED_WORDS = Set.of("enum", "extends", "package", "void", "object");

    private KeyWordUtils() {}

    public static String getKeyWordCompatibleName(String name) {
        if (isReserved(name.toLowerCase())) {
            return "_" + name;
        }
        return name;
    }

    public static boolean isReserved(String value) {
        return RESERVED_WORDS.contains(value.toLowerCase());
    }
}
