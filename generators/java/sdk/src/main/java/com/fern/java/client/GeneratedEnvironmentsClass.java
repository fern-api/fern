package com.fern.java.client;

import com.fern.ir.model.environment.EnvironmentBaseUrlId;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.squareup.javapoet.MethodSpec;
import java.util.Map;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedEnvironmentsClass extends AbstractGeneratedJavaFile {

    public abstract Optional<String> defaultEnvironmentConstant();

    public abstract boolean optionsPresent();

    public abstract EnvironmentClassInfo info();

    public static ImmutableGeneratedEnvironmentsClass.ClassNameBuildStage builder() {
        return ImmutableGeneratedEnvironmentsClass.builder();
    }

    public abstract static class EnvironmentClassInfo {}

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public abstract static class SingleUrlEnvironmentClass extends EnvironmentClassInfo {
        public abstract MethodSpec getUrlMethod();

        public abstract MethodSpec getCustomMethod();

        public static ImmutableSingleUrlEnvironmentClass.UrlMethodBuildStage builder() {
            return ImmutableSingleUrlEnvironmentClass.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public abstract static class MultiUrlEnvironmentsClass extends EnvironmentClassInfo {
        public abstract Map<EnvironmentBaseUrlId, MethodSpec> urlGetterMethods();

        public static ImmutableMultiUrlEnvironmentsClass.Builder builder() {
            return ImmutableMultiUrlEnvironmentsClass.builder();
        }
    }
}
