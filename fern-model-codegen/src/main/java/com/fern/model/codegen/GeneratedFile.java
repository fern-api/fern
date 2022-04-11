package com.fern.model.codegen;

import com.squareup.javapoet.JavaFile;

public interface GeneratedFile<D> {

    JavaFile file();

    D definition();

    default String className() {
        return file().typeSpec.name;
    }

    default String packageName() {
        return file().packageName;
    }
}
