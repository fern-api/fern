package com.fern.java.client;

import com.fern.ir.model.http.FileProperty;
import com.fern.ir.model.http.FileUploadBodyProperty;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.squareup.javapoet.MethodSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedWrappedRequest extends AbstractGeneratedJavaFile {

    public abstract List<EnrichedObjectProperty> headerParams();

    public abstract Map<String, String> headerWireValues();

    public abstract List<EnrichedObjectProperty> queryParams();

    public abstract List<EnrichedObjectProperty> pathParams();

    public abstract Optional<RequestBodyGetter> requestBodyGetter();

    public static ImmutableGeneratedWrappedRequest.ClassNameBuildStage builder() {
        return ImmutableGeneratedWrappedRequest.builder();
    }

    public interface RequestBodyGetter {}

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface InlinedRequestBodyGetters extends RequestBodyGetter {

        List<EnrichedObjectProperty> properties();

        static ImmutableInlinedRequestBodyGetters.Builder builder() {
            return ImmutableInlinedRequestBodyGetters.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface UrlFormEncodedGetters extends RequestBodyGetter {

        List<EnrichedObjectProperty> properties();

        static ImmutableUrlFormEncodedGetters.Builder builder() {
            return ImmutableUrlFormEncodedGetters.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface ReferencedRequestBodyGetter extends RequestBodyGetter {

        MethodSpec requestBodyGetter();

        static ImmutableReferencedRequestBodyGetter.RequestBodyGetterBuildStage builder() {
            return ImmutableReferencedRequestBodyGetter.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface FileUploadRequestBodyGetters extends RequestBodyGetter {

        List<FileUploadProperty> properties();

        List<FileProperty> fileProperties();

        static ImmutableFileUploadRequestBodyGetters.Builder builder() {
            return ImmutableFileUploadRequestBodyGetters.builder();
        }
    }

    public interface FileUploadProperty {}

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface JsonFileUploadProperty extends FileUploadProperty {
        EnrichedObjectProperty objectProperty();

        FileUploadBodyProperty rawProperty();

        static ImmutableJsonFileUploadProperty.ObjectPropertyBuildStage builder() {
            return ImmutableJsonFileUploadProperty.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface FilePropertyContainer extends FileUploadProperty {
        FileProperty fileProperty();

        static ImmutableFilePropertyContainer.FilePropertyBuildStage builder() {
            return ImmutableFilePropertyContainer.builder();
        }
    }
}
