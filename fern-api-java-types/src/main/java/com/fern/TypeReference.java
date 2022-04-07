package com.fern;

import com.fasterxml.jackson.annotation.*;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.Map;

@Value.Enclosing
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
        return new TypeReference(Named.of(value));
    }

    public static TypeReference primitive(PrimitiveType value) {
        return new TypeReference(Primitive.of(value));
    }

    public static TypeReference container(ContainerType value) {
        return new TypeReference(Container.of(value));
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

    @Value.Immutable()
    @JsonTypeName("named")
    @StagedBuilderStyle
    interface Named extends Base {

        @JsonValue
        NamedTypeReference named();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitNamed(named());
        }

        static Named of(NamedTypeReference value) {
            return ImmutableTypeReference.Named.builder().named(value).build();
        }
    }

    @Value.Immutable
    @JsonTypeName("primitive")
    @StagedBuilderStyle
    interface Primitive extends Base {

        @JsonValue
        PrimitiveType primitive();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitPrimitive(primitive());
        }

        static Primitive of(PrimitiveType value) {
            return ImmutableTypeReference.Primitive.builder().primitive(value).build();
        }
    }

    @Value.Immutable
    @JsonTypeName("container")
    @StagedBuilderStyle
    public interface Container extends Base {

        @JsonValue
        ContainerType container();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitContainer(container());
        }

        static Container of(ContainerType value) {
            return ImmutableTypeReference.Container.builder().container(value).build();
        }
    }

    @Value.Immutable
    @StagedBuilderStyle
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
    }

    public interface Visitor<T> {
        T visitNamed(NamedTypeReference value);

        T visitPrimitive(PrimitiveType value);

        T visitContainer(ContainerType value);

        T visitUnknown(String unknownType);
    }
}
