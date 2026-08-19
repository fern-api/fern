using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record SendLiteralsInlinedRequest
{
    [JsonRequired]
    [JsonPropertyName("prompt")]
    public SendLiteralsInlinedRequest.PromptLiteral Prompt { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonPropertyName("context")]
    public string? Context { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; set; }

    [JsonRequired]
    [JsonPropertyName("stream")]
    public SendLiteralsInlinedRequest.StreamLiteral Stream { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonRequired]
    [JsonPropertyName("aliasedContext")]
    public SomeAliasedLiteral AliasedContext { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("objectWithLiteral")]
    public required ATopLevelLiteral ObjectWithLiteral { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [JsonConverter(typeof(PromptLiteralConverter))]
    public readonly struct PromptLiteral
    {
        public const string Value = "You are a helpful assistant";

        public static implicit operator string(PromptLiteral _) => Value;

        public override string ToString() => Value;

        public override int GetHashCode() =>
            global::System.StringComparer.Ordinal.GetHashCode(Value);

        public override bool Equals(object? obj) => obj is PromptLiteral;

        public static bool operator ==(PromptLiteral _, PromptLiteral __) => true;

        public static bool operator !=(PromptLiteral _, PromptLiteral __) => false;

        internal sealed class PromptLiteralConverter : JsonConverter<PromptLiteral>
        {
            public override PromptLiteral Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != PromptLiteral.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + PromptLiteral.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new PromptLiteral();
            }

            public override void Write(
                Utf8JsonWriter writer,
                PromptLiteral value,
                JsonSerializerOptions options
            ) => writer.WriteStringValue(PromptLiteral.Value);

            public override PromptLiteral ReadAsPropertyName(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != PromptLiteral.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + PromptLiteral.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new PromptLiteral();
            }

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                PromptLiteral value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(PromptLiteral.Value);
        }
    }

    [JsonConverter(typeof(StreamLiteralConverter))]
    public readonly struct StreamLiteral
    {
        public const bool Value = false;

        public static implicit operator bool(StreamLiteral _) => Value;

        public override string ToString() => Value.ToString();

        public override int GetHashCode() => Value.GetHashCode();

        public override bool Equals(object? obj) => obj is StreamLiteral;

        public static bool operator ==(StreamLiteral _, StreamLiteral __) => true;

        public static bool operator !=(StreamLiteral _, StreamLiteral __) => false;

        internal sealed class StreamLiteralConverter : JsonConverter<StreamLiteral>
        {
            public override StreamLiteral Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetBoolean();
                if (value != StreamLiteral.Value)
                {
                    throw new JsonException("Expected false for type discriminator but got true.");
                }
                return new StreamLiteral();
            }

            public override void Write(
                Utf8JsonWriter writer,
                StreamLiteral value,
                JsonSerializerOptions options
            ) => writer.WriteBooleanValue(StreamLiteral.Value);

            public override StreamLiteral ReadAsPropertyName(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (!bool.TryParse(value, out var boolValue) || boolValue != StreamLiteral.Value)
                {
                    throw new JsonException(
                        "Expected false for type discriminator but got \"" + value + "\"."
                    );
                }
                return new StreamLiteral();
            }

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                StreamLiteral value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(StreamLiteral.Value.ToString());
        }
    }
}
