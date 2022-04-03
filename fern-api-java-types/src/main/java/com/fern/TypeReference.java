package com.fern;

import com.fasterxml.jackson.annotation.*;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.Map;

public final class TypeReference {

    private final Base value;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    private TypeReference(Base value) {
        this.value = value;
    }

    @JsonValue
    private Base getValue() {
        return value;
    }

    public static TypeReference named(NamedTypeReference value) {
        return new TypeReference(Named.builder().named(value).build());
    }

    public static TypeReference primitive(PrimitiveType value) {
        return new TypeReference(Primitive.builder().primitive(value).build());
    }

    public static TypeReference container(ContainerType value) {
        return new TypeReference(Container.builder().container(value).build());
    }

    public boolean isNamed() {
        return value instanceof Named;
    }

    public boolean isPrimitive() {
        return value instanceof Primitive;
    }

    public boolean isContainer() {
        return value instanceof Container;
    }

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXISTING_PROPERTY,
            property = "type",
            visible = true,
            defaultImpl = Unknown.class)
    @JsonSubTypes({
            @JsonSubTypes.Type(Named.class),
            @JsonSubTypes.Type(Primitive.class),
            @JsonSubTypes.Type(Container.class)
    })
    @JsonIgnoreProperties(ignoreUnknown = true)
    private interface Base {
        <T> T accept(Visitor<T> visitor);
    }

    @Value.Immutable
    @JsonTypeName("named")
    @StagedImmutablesStyle
    interface Named extends Base {

        @JsonValue
        NamedTypeReference named();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitNamed(named());
        }

        static ImmutableNamed.NamedBuildStage builder() {
            return ImmutableNamed.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("primitive")
    @StagedImmutablesStyle
    interface Primitive extends Base {

        @JsonValue
        PrimitiveType primitive();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitPrimitive(primitive());
        }

        static ImmutablePrimitive.PrimitiveBuildStage builder() {
            return ImmutablePrimitive.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("container")
    @StagedImmutablesStyle
    public interface Container extends Base {

        @JsonValue
        ContainerType container();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitContainer(container());
        }

        static ImmutableContainer.ContainerBuildStage builder() {
            return ImmutableContainer.builder();
        }
    }

    @Value.Immutable
    @StagedImmutablesStyle
    interface Unknown extends Base {

        @JsonValue
        Map<String, Object> value();

        default String type() {
            return value().get("type").toString();
        }

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitUnknown(type());
        }

        static ImmutableUnknown.Builder builder() {
            return ImmutableUnknown.builder();
        }
    }

    public interface Visitor<T> {
        T visitNamed(NamedTypeReference value);

        T visitPrimitive(PrimitiveType value);

        T visitContainer(ContainerType value);

        T visitUnknown(String unknownType);
    }
}
