package com.fern.java.output.gradle;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class ParsedGradleDependency extends AbstractGradleDependency {

    public static final String JACKSON_JDK8_VERSION = "2.18.2";
    public static final String JACKSON_DATABIND_VERSION = "2.18.2";
    public static final String UTILS_VERSION = "0.0.82";
    public static final String OKHTTP_VERSION = "5.2.1";
    public static final String FEIGN_VERSION = "11.8";

    public static final String JUNIT_DEPENDENCY = "5.8.2";

    public abstract String group();

    public abstract String artifact();

    public abstract String version();

    @Override
    public final String coordinate() {
        return "'" + group() + ":" + artifact() + ":" + version() + "'";
    }

    public static ImmutableParsedGradleDependency.TypeBuildStage builder() {
        return ImmutableParsedGradleDependency.builder();
    }
}
