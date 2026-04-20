// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

/// <summary>
/// A union with a variant named "types" that could collide with the inline Types class
/// </summary>
[JsonConverter(typeof(UnionWithTypesVariant.JsonConverter))]
[Serializable]
public record UnionWithTypesVariant
{
    internal UnionWithTypesVariant(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithTypesVariant with <see cref="UnionWithTypesVariant.Types"/>.
    /// </summary>
    public UnionWithTypesVariant(UnionWithTypesVariant.Types value)
    {
        Type = "types";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithTypesVariant with <see cref="UnionWithTypesVariant.OtherVariant"/>.
    /// </summary>
    public UnionWithTypesVariant(UnionWithTypesVariant.OtherVariant value)
    {
        Type = "otherVariant";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "types"
    /// </summary>
    public bool IsTypes => Type == "types";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "otherVariant"
    /// </summary>
    public bool IsOtherVariant => Type == "otherVariant";

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1"/> if <see cref="Type"/> is 'types', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'types'.</exception>
    public SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1 AsTypes() =>
        IsTypes
            ? (SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1)Value!
            : throw new global::System.Exception("UnionWithTypesVariant.Type is not 'types'");

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1"/> if <see cref="Type"/> is 'otherVariant', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'otherVariant'.</exception>
    public SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1 AsOtherVariant() =>
        IsOtherVariant
            ? (SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1)
                Value!
            : throw new global::System.Exception(
                "UnionWithTypesVariant.Type is not 'otherVariant'"
            );

    public T Match<T>(
        Func<
            SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1,
            T
        > onTypes,
        Func<
            SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1,
            T
        > onOtherVariant,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "types" => onTypes(AsTypes()),
            "otherVariant" => onOtherVariant(AsOtherVariant()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1> onTypes,
        Action<SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1> onOtherVariant,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "types":
                onTypes(AsTypes());
                break;
            case "otherVariant":
                onOtherVariant(AsOtherVariant());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1"/> and returns true if successful.
    /// </summary>
    public bool TryAsTypes(
        out SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1? value
    )
    {
        if (Type == "types")
        {
            value = (SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1)
                Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1"/> and returns true if successful.
    /// </summary>
    public bool TryAsOtherVariant(
        out SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1? value
    )
    {
        if (Type == "otherVariant")
        {
            value =
                (SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1)
                    Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithTypesVariant(UnionWithTypesVariant.Types value) =>
        new(value);

    public static implicit operator UnionWithTypesVariant(
        UnionWithTypesVariant.OtherVariant value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithTypesVariant>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithTypesVariant).IsAssignableFrom(typeToConvert);

        public override UnionWithTypesVariant Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "types" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1"
                        ),
                "otherVariant" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithTypesVariant(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithTypesVariant value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "types" => JsonSerializer.SerializeToNode(value.Value, options),
                    "otherVariant" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithTypesVariant ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithTypesVariant(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithTypesVariant value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for types
    /// </summary>
    [Serializable]
    public struct Types
    {
        public Types(
            SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1 value
        )
        {
            Value = value;
        }

        internal SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTypesVariant.Types(
            SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantInlineType1 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for otherVariant
    /// </summary>
    [Serializable]
    public struct OtherVariant
    {
        public OtherVariant(
            SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1 value
        )
        {
            Value = value;
        }

        internal SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTypesVariant.OtherVariant(
            SeedObject.UnionWithTypesVariant.InnerTypes.UnionWithTypesVariantOtherInlineType1 value
        ) => new(value);
    }

    public static class InnerTypes
    {
        /// <summary>
        /// lorem ipsum
        /// </summary>
        [Serializable]
        public record UnionWithTypesVariantInlineType1 : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("foo")]
            public required string Foo { get; set; }

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("ref")]
            public required ReferenceType Ref { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }
        }

        /// <summary>
        /// lorem ipsum
        /// </summary>
        [Serializable]
        public record UnionWithTypesVariantOtherInlineType1 : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("bar")]
            public required string Bar { get; set; }

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("ref")]
            public required ReferenceType Ref { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }
        }
    }
}
