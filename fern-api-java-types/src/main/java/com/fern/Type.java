package com.fern;

import com.fasterxml.jackson.annotation.*;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.Map;

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
        return new Type(Object.builder().object(value).build());
    }

    public static Type union(UnionTypeDefinition value) {
        return new Type(Union.builder().union(value).build());
    }

    public static Type alias(AliasTypeDefinition value) {
        return new Type(Alias.builder().alias(value).build());
    }

    public static Type _enum(EnumTypeDefinition value) {
        return new Type(Enum.builder()._enum(value).build());
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
    @JsonTypeName("named")
    @StagedImmutablesStyle
    interface Object extends Base {

        @JsonValue
        ObjectTypeDefinition object();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitObject(object());
        }

        static ImmutableObject.ObjectBuildStage builder() {
            return ImmutableObject.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("primitive")
    @StagedImmutablesStyle
    interface Union extends Base {

        @JsonValue
        UnionTypeDefinition union();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitUnion(union());
        }

        static ImmutableUnion.UnionBuildStage builder() {
            return ImmutableUnion.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("container")
    @StagedImmutablesStyle
    interface Alias extends Base {

        @JsonValue
        AliasTypeDefinition alias();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitAlias(alias());
        }

        static ImmutableAlias.AliasBuildStage builder() {
            return ImmutableAlias.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("container")
    @StagedImmutablesStyle
    interface Enum extends Base {

        @JsonValue
        EnumTypeDefinition _enum();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitEnum(_enum());
        }

        static ImmutableEnum._enumBuildStage builder() {
            return ImmutableEnum.builder();
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

    interface Visitor<T> {
        T visitObject(ObjectTypeDefinition value);

        T visitUnion(UnionTypeDefinition value);

        T visitAlias(AliasTypeDefinition value);

        T visitEnum(EnumTypeDefinition value);

        T visitUnknown(String unknownType);
    }
}
