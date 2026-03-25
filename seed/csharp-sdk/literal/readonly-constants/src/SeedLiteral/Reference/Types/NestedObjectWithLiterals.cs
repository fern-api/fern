using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(NestedObjectWithLiterals.JsonConverter))]
[Serializable]
public record NestedObjectWithLiterals
{
    [JsonRequired]
    [JsonPropertyName("literal1")]
    public NestedObjectWithLiterals.Literal1Literal Literal1 { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonRequired]
    [JsonPropertyName("literal2")]
    public NestedObjectWithLiterals.Literal2Literal Literal2 { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonPropertyName("strProp")]
    public required string StrProp { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedObjectWithLiterals>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NestedObjectWithLiterals).IsAssignableFrom(typeToConvert);

        public override NestedObjectWithLiterals? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            NestedObjectWithLiterals.Literal1Literal _literal1 = default;
            NestedObjectWithLiterals.Literal2Literal _literal2 = default;
            string _strProp = default;
            var extensionData = new Dictionary<string, JsonElement>();

            if (reader.TokenType != JsonTokenType.StartObject)
            {
                throw new JsonException("Expected StartObject");
            }

            while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
            {
                var propertyName = reader.GetString();
                reader.Read();

                switch (propertyName)
                {
                    case "literal1":
                        _literal1 =
                            JsonSerializer.Deserialize<NestedObjectWithLiterals.Literal1Literal>(
                                ref reader,
                                options
                            );
                        break;
                    case "literal2":
                        _literal2 =
                            JsonSerializer.Deserialize<NestedObjectWithLiterals.Literal2Literal>(
                                ref reader,
                                options
                            );
                        break;
                    case "strProp":
                        _strProp = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NestedObjectWithLiterals
            {
                Literal1 = _literal1,
                Literal2 = _literal2,
                StrProp = _strProp,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithLiterals value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("literal1");
            JsonSerializer.Serialize(writer, value.Literal1, options);
            writer.WritePropertyName("literal2");
            JsonSerializer.Serialize(writer, value.Literal2, options);
            writer.WritePropertyName("strProp");
            JsonSerializer.Serialize(writer, value.StrProp, options);
            if (value.AdditionalProperties != null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override NestedObjectWithLiterals ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<NestedObjectWithLiterals>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedObjectWithLiterals value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }

    [JsonConverter(typeof(Literal1LiteralConverter))]
    public readonly struct Literal1Literal
    {
        public const string Value = "literal1";

        public static implicit operator string(Literal1Literal _) => Value;

        public override string ToString() => Value;

        public override int GetHashCode() =>
            global::System.StringComparer.Ordinal.GetHashCode(Value);

        public override bool Equals(object? obj) => obj is Literal1Literal;

        public static bool operator ==(Literal1Literal _, Literal1Literal __) => true;

        public static bool operator !=(Literal1Literal _, Literal1Literal __) => false;

        internal sealed class Literal1LiteralConverter : JsonConverter<Literal1Literal>
        {
            public override Literal1Literal Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != Literal1Literal.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + Literal1Literal.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new Literal1Literal();
            }

            public override void Write(
                Utf8JsonWriter writer,
                Literal1Literal value,
                JsonSerializerOptions options
            ) => writer.WriteStringValue(Literal1Literal.Value);

            public override Literal1Literal ReadAsPropertyName(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != Literal1Literal.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + Literal1Literal.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new Literal1Literal();
            }

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                Literal1Literal value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(Literal1Literal.Value);
        }
    }

    [JsonConverter(typeof(Literal2LiteralConverter))]
    public readonly struct Literal2Literal
    {
        public const string Value = "literal2";

        public static implicit operator string(Literal2Literal _) => Value;

        public override string ToString() => Value;

        public override int GetHashCode() =>
            global::System.StringComparer.Ordinal.GetHashCode(Value);

        public override bool Equals(object? obj) => obj is Literal2Literal;

        public static bool operator ==(Literal2Literal _, Literal2Literal __) => true;

        public static bool operator !=(Literal2Literal _, Literal2Literal __) => false;

        internal sealed class Literal2LiteralConverter : JsonConverter<Literal2Literal>
        {
            public override Literal2Literal Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != Literal2Literal.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + Literal2Literal.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new Literal2Literal();
            }

            public override void Write(
                Utf8JsonWriter writer,
                Literal2Literal value,
                JsonSerializerOptions options
            ) => writer.WriteStringValue(Literal2Literal.Value);

            public override Literal2Literal ReadAsPropertyName(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != Literal2Literal.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + Literal2Literal.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new Literal2Literal();
            }

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                Literal2Literal value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(Literal2Literal.Value);
        }
    }
}
