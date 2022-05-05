package com.fern.codegen;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;

public interface IGeneratedFile {

    JavaFile file();

    ClassName className();

    default String packageName() {
        return file().packageName;
    }
}
