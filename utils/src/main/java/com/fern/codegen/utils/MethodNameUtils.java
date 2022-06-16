package com.fern.codegen.utils;

public final class MethodNameUtils {

    private MethodNameUtils() {}

    public static String getCompatibleMethodName(String name) {
        StringBuilder camelCaseNameBuilder = new StringBuilder();
        for (int i = 0; i < name.length(); ++i) {
            if (i == 0) {
                camelCaseNameBuilder.append(Character.toLowerCase(name.charAt(i)));
            } else {
                camelCaseNameBuilder.append(name.charAt(i));
            }
        }
        String camelCasedClassName = camelCaseNameBuilder.toString();
        return KeyWordUtils.getKeyWordCompatibleName(camelCasedClassName);
    }
}
