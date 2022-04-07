package com.fern;

import com.fasterxml.jackson.annotation.*;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.Map;

@Value.Enclosing
public final class Type {

    private final Base value;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    private Type(Base value) {
        this.value = value;
    }

    @JsonValue
    private Base getValue() {
        return value;
    }

    public static Type object(ObjectTypeDefinition value) {
        return new Type(_Object.of(value));
    }

    public static Type union(UnionTypeDefinition value) {
        return new Type(Union.of(value));
    }

    public static Type alias(AliasTypeDefinition value) {
        return new Type(Alias.of(value));
    }

    public static Type _enum(EnumTypeDefinition value) {
        return new Type(Enum.of(value));
    }

    public boolean isObject() {
        return value instanceof Object;
    }

    public boolean isUnion() {
        return value instanceof Union;
    }

    public boolean isAlias() {
        return value instanceof Alias;
    }

    public boolean isEnum() {
        return value instanceof Enum;
    }

    public <T> T accept(Visitor<T> visitor) {
        return value.accept(visitor);
    }

    public interface Visitor<T> {
        T visitObject(ObjectTypeDefinition value);

        T visitUnion(UnionTypeDefinition value);

        T visitAlias(AliasTypeDefinition value);

        T visitEnum(EnumTypeDefinition value);

        T visitUnknown(String unknownType);
    }

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXISTING_PROPERTY,
            property = "type",
            visible = true,
            defaultImpl = Unknown.class)
    @JsonSubTypes({
            @JsonSubTypes.Type(Object.class),
            @JsonSubTypes.Type(Union.class),
            @JsonSubTypes.Type(Alias.class),
            @JsonSubTypes.Type(Enum.class)
    })
    @JsonIgnoreProperties(ignoreUnknown = true)
    private interface Base {
        <T> T accept(Visitor<T> visitor);
    }

    @Value.Immutable
    @JsonTypeName("object")
    interface _Object extends Base {

        @JsonValue
        ObjectTypeDefinition object();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitObject(object());
        }

        static _Object of(ObjectTypeDefinition value) {
            return ImmutableType._Object.builder().object(value).build();
        }
    }

    @Value.Immutable
    @JsonTypeName("union")
    interface Union extends Base {

        @JsonValue
        UnionTypeDefinition union();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitUnion(union());
        }

        static Union of(UnionTypeDefinition value) {
            return ImmutableType.Union.builder().union(value).build();
        }
    }

    @Value.Immutable
    @JsonTypeName("alias")
    @StagedBuilderStyle
    interface Alias extends Base {

        @JsonValue
        AliasTypeDefinition alias();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitAlias(alias());
        }

        static Alias of(AliasTypeDefinition value) {
            return ImmutableType.Alias.builder().alias(value).build();
        }
    }

    @Value.Immutable
    @JsonTypeName("enum")
    @StagedBuilderStyle
    interface Enum extends Base {

        @JsonValue
        EnumTypeDefinition _enum();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitEnum(_enum());
        }

        static Enum of(EnumTypeDefinition value) {
            return ImmutableType.Enum.builder()._enum(value).build();
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
}
