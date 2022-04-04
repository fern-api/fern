package com.fern.immutables;

import org.immutables.value.Value;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.PACKAGE, ElementType.TYPE})
@Retention(RetentionPolicy.CLASS)
@Value.Style(
        jdkOnly = true,
        get = {"get*", "is*"},
        stagedBuilder = true)
public @interface StagedImmutablesStyle {}
