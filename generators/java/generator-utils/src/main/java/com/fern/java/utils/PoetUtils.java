package com.fern.java.utils;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.MethodSpec.Builder;
import java.util.Arrays;
import javax.lang.model.element.Modifier;

public class PoetUtils {
    public static MethodSpec createGetter(FieldSpec fieldSpec, ClassName... annotations) {
        Builder builder = MethodSpec.methodBuilder(fieldSpec.name)
                .addJavadoc("@return the $L", fieldSpec.name)
                .addModifiers(Modifier.PUBLIC)
                .returns(fieldSpec.type)
                .addStatement("return this.$L", fieldSpec.name);
        Arrays.stream(annotations).forEach(builder::addAnnotation);
        return builder.build();
    }
}
