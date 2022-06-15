package com.fern;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.immutables.value.Value;

@Target({ElementType.PACKAGE, ElementType.TYPE})
@Retention(RetentionPolicy.SOURCE)
@Value.Style(
    jdkOnly = true,
    visibility = Value.Style.ImplementationVisibility.PACKAGE,
    overshadowImplementation = true
)
public @interface PackagePrivateStyle {
}
