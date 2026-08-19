package com.fern.java;

import com.fern.java.immutables.AliasImmutablesStyle;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.TypeSpec;
import org.immutables.value.Value;

@Value.Immutable
@AliasImmutablesStyle
public interface PoetTypeWithClassName {

    ClassName className();

    TypeSpec typeSpec();

    static PoetTypeWithClassName of(ClassName className, TypeSpec typeSpec) {
        return ImmutablePoetTypeWithClassName.of(className, typeSpec);
    }
}
