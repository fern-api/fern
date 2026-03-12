using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record SendRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonRequired]
    [JsonPropertyName("prompt")]
    public SendRequest.PromptLiteral Prompt { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonRequired]
    [JsonPropertyName("stream")]
    public SendRequest.StreamLiteral Stream { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonRequired]
    [JsonPropertyName("ending")]
    public SendRequest.EndingLiteral Ending { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonRequired]
    [JsonPropertyName("context")]
    public SomeLiteral Context { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("containerObject")]
    public required ContainerObject ContainerObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

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
            Value.GetHashCode(global::System.StringComparison.Ordinal);

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
        }
    }

    [JsonConverter(typeof(EndingLiteralConverter))]
    public readonly struct EndingLiteral
    {
        public const string Value = "$ending";

        public static implicit operator string(EndingLiteral _) => Value;

        public override string ToString() => Value;

        public override int GetHashCode() =>
            Value.GetHashCode(global::System.StringComparison.Ordinal);

        public override bool Equals(object? obj) => obj is EndingLiteral;

        public static bool operator ==(EndingLiteral _, EndingLiteral __) => true;

        public static bool operator !=(EndingLiteral _, EndingLiteral __) => false;

        internal sealed class EndingLiteralConverter : JsonConverter<EndingLiteral>
        {
            public override EndingLiteral Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != EndingLiteral.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + EndingLiteral.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new EndingLiteral();
            }

            public override void Write(
                Utf8JsonWriter writer,
                EndingLiteral value,
                JsonSerializerOptions options
            ) => writer.WriteStringValue(EndingLiteral.Value);
        }
    }
}
