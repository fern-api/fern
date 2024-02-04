package com.fern.java.utils;

import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;

public final class CasingUtils {

    private static final Pattern KEBAB_CASE_PATTERN = Pattern.compile("-([a-z])");

    private CasingUtils() {}

    public static String convertKebabCaseToUpperCamelCase(String kebab) {
        return StringUtils.capitalize(
                KEBAB_CASE_PATTERN.matcher(kebab).replaceAll(mr -> mr.group(1).toUpperCase()));
    }
}
