package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.FileUploadRequest;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.http.InlinedRequestBodyProperty;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import java.util.List;
import java.util.Optional;

public class Utils {

    public static Optional<TypeReference> getPropertyTypeFromRequest(
            HttpEndpoint httpEndpoint, Name desiredPropertyName, AbstractGeneratorContext<?, ?> generatorContext) {
        if (httpEndpoint.getRequestBody().isEmpty()) {
            return Optional.empty();
        }

        HttpRequestBody body = httpEndpoint.getRequestBody().get();
        return body.visit(new TypeReferenceFinder(desiredPropertyName, generatorContext));
    }

    public static class TypeReferenceFinder implements HttpRequestBody.Visitor<Optional<TypeReference>> {

        private final Name desiredPropertyName;
        private final AbstractGeneratorContext<?, ?> generatorContext;

        public TypeReferenceFinder(Name desiredPropertyName, AbstractGeneratorContext<?, ?> generatorContext) {
            this.desiredPropertyName = desiredPropertyName;
            this.generatorContext = generatorContext;
        }

        @Override
        public Optional<TypeReference> visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
            Optional<TypeReference> maybeFoundExtended = inlinedRequestBody.getExtendedProperties().stream()
                    .flatMap(List::stream)
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(ObjectProperty::getValueType)
                    .findAny();

            if (maybeFoundExtended.isPresent()) {
                return maybeFoundExtended;
            }

            return inlinedRequestBody.getProperties().stream()
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(InlinedRequestBodyProperty::getValueType)
                    .findAny();
        }

        @Override
        public Optional<TypeReference> visitReference(HttpRequestBodyReference httpRequestBodyReference) {
            // TODO(ajgateno): Should not happen for this use-case since we should only allow named types for
            //  pagination.
            if (httpRequestBodyReference.getRequestBodyType().getNamed().isEmpty()) {
                return Optional.empty();
            }

            Optional<TypeDeclaration> maybeDeclaration = Optional.ofNullable(generatorContext
                    .getTypeDeclarations()
                    .get(httpRequestBodyReference
                            .getRequestBodyType()
                            .getNamed()
                            .get()
                            .getTypeId()));

            if (maybeDeclaration.isEmpty()) {
                return Optional.empty();
            }

            TypeDeclaration declaration = maybeDeclaration.get();
            Optional<ObjectTypeDeclaration> maybeObjectDeclaration =
                    declaration.getShape().getObject();

            if (maybeObjectDeclaration.isEmpty()) {
                return Optional.empty();
            }

            ObjectTypeDeclaration objectDeclaration = maybeObjectDeclaration.get();

            Optional<TypeReference> maybeFoundExtended = objectDeclaration.getExtendedProperties().stream()
                    .flatMap(List::stream)
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(ObjectProperty::getValueType)
                    .findAny();

            if (maybeFoundExtended.isPresent()) {
                return maybeFoundExtended;
            }

            return objectDeclaration.getProperties().stream()
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(ObjectProperty::getValueType)
                    .findAny();
        }

        @Override
        public Optional<TypeReference> visitFileUpload(FileUploadRequest fileUploadRequest) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeReference> visitBytes(BytesRequest bytesRequest) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeReference> _visitUnknown(Object o) {
            return Optional.empty();
        }
    }
}
