package com.fern.java.utils;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;

public final class NameUtils {

    private NameUtils() {}

    public static Name concat(Name first, Name second) {
        return Name.builder()
                .originalName(first.getOriginalName() + second.getOriginalName())
                .camelCase(concat(first.getCamelCase(), second.getPascalCase(), ""))
                .pascalCase(concat(first.getPascalCase(), second.getPascalCase(), ""))
                .snakeCase(concat(first.getSnakeCase(), second.getSnakeCase(), "_"))
                .screamingSnakeCase(concat(first.getScreamingSnakeCase(), second.getScreamingSnakeCase(), "_"))
                .build();
    }

    public static SafeAndUnsafeString concat(SafeAndUnsafeString first, SafeAndUnsafeString second, String separator) {
        return SafeAndUnsafeString.builder()
                .unsafeName(first.getUnsafeName() + separator + second.getUnsafeName())
                .safeName(first.getSafeName() + separator + second.getSafeName())
                .build();
    }
}
