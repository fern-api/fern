package com.fern.jersey;

import com.fern.types.services.http.HttpPath;
import com.fern.types.services.http.HttpPathPart;

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
