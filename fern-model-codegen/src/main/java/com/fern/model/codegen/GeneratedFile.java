package com.fern.model.codegen;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;

public interface GeneratedFile<D> {

    JavaFile file();

    D definition();

    ClassName className();

    default String packageName() {
        return file().packageName;
    }
}
