package com.fern.jersey;

import com.fern.types.services.http.HttpMethod;
import com.squareup.javapoet.AnnotationSpec;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;

public final class HttpMethodAnnotationVisitor implements HttpMethod.Visitor<AnnotationSpec> {

    public static final HttpMethodAnnotationVisitor INSTANCE = new HttpMethodAnnotationVisitor();

    @Override
    public AnnotationSpec visitGET() {
        return AnnotationSpec.builder(GET.class).build();
    }

    @Override
    public AnnotationSpec visitPOST() {
        return AnnotationSpec.builder(POST.class).build();
    }

    @Override
    public AnnotationSpec visitPUT() {
        return AnnotationSpec.builder(PUT.class).build();
    }

    @Override
    public AnnotationSpec visitDELETE() {
        return AnnotationSpec.builder(DELETE.class).build();
    }

    @Override
    public AnnotationSpec visitPATCH() {
        return AnnotationSpec.builder(PATCH.class).build();
    }

    @Override
    public AnnotationSpec visitUnknown(String unknownType) {
        throw new RuntimeException("Encountered unknown HttpMethod: " + unknownType);
    }
}
