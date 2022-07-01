package com.fern.java.immutables;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.immutables.value.Value.Immutable;
import org.immutables.value.Value.Style;
import org.immutables.value.Value.Style.ImplementationVisibility;

@Target({ElementType.PACKAGE, ElementType.TYPE})
@Retention(RetentionPolicy.SOURCE)
@Style(
        allParameters = true,
        visibility = ImplementationVisibility.PACKAGE,
        overshadowImplementation = true,
        defaults = @Immutable(builder = false))
public @interface AliasImmutablesStyle {}
