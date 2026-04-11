using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record NestedObjectWithLiterals : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

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

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
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
