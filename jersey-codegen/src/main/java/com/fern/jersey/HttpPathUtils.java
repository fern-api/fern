package com.fern.jersey;

import com.fern.types.services.HttpPath;
import com.fern.types.services.HttpPathPart;

public class HttpPathUtils {

    private HttpPathUtils() {}

    public static String getJerseyCompatiblePath(HttpPath httpPath) {
        String result = httpPath.head();
        for (HttpPathPart httpPathPart : httpPath.parts()) {
            result += "{" + httpPathPart.pathParameter() + "}" + httpPathPart.tail();
        }
        return result;
    }
}
