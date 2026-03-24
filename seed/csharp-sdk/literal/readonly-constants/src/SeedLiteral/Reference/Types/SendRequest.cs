using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(SendRequest.JsonConverter))]
[Serializable]
public record SendRequest
{
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

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SendRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SendRequest).IsAssignableFrom(typeToConvert);

        public override SendRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _query = default;
            string? _maybeContext = default;
            ContainerObject _containerObject = default;
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
                    case "prompt":
                        reader.Skip();
                        break;
                    case "query":
                        _query = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "stream":
                        reader.Skip();
                        break;
                    case "ending":
                        reader.Skip();
                        break;
                    case "context":
                        reader.Skip();
                        break;
                    case "maybeContext":
                        _maybeContext = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "containerObject":
                        _containerObject = JsonSerializer.Deserialize<ContainerObject>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SendRequest
            {
                Query = _query,
                MaybeContext = _maybeContext,
                ContainerObject = _containerObject,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("prompt");
            JsonSerializer.Serialize(writer, value.Prompt, options);
            writer.WritePropertyName("query");
            JsonSerializer.Serialize(writer, value.Query, options);
            writer.WritePropertyName("stream");
            JsonSerializer.Serialize(writer, value.Stream, options);
            writer.WritePropertyName("ending");
            JsonSerializer.Serialize(writer, value.Ending, options);
            writer.WritePropertyName("context");
            JsonSerializer.Serialize(writer, value.Context, options);
            if (value.MaybeContext != null)
            {
                writer.WritePropertyName("maybeContext");
                JsonSerializer.Serialize(writer, value.MaybeContext, options);
            }
            writer.WritePropertyName("containerObject");
            JsonSerializer.Serialize(writer, value.ContainerObject, options);
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

        public override SendRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SendRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SendRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
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

    [JsonConverter(typeof(EndingLiteralConverter))]
    public readonly struct EndingLiteral
    {
        public const string Value = "$ending";

        public static implicit operator string(EndingLiteral _) => Value;

        public override string ToString() => Value;

        public override int GetHashCode() =>
            global::System.StringComparer.Ordinal.GetHashCode(Value);

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

            public override EndingLiteral ReadAsPropertyName(
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

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                EndingLiteral value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(EndingLiteral.Value);
        }
    }
}
