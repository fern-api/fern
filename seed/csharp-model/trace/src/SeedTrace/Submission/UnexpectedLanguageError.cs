using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(UnexpectedLanguageError.JsonConverter))]
[Serializable]
public record UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    public required Language ExpectedLanguage { get; set; }

    [JsonPropertyName("actualLanguage")]
    public required Language ActualLanguage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnexpectedLanguageError>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnexpectedLanguageError).IsAssignableFrom(typeToConvert);

        public override UnexpectedLanguageError? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Language _expectedLanguage = default;
            Language _actualLanguage = default;
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
                    case "expectedLanguage":
                        _expectedLanguage = JsonSerializer.Deserialize<Language>(
                            ref reader,
                            options
                        );
                        break;
                    case "actualLanguage":
                        _actualLanguage = JsonSerializer.Deserialize<Language>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UnexpectedLanguageError
            {
                ExpectedLanguage = _expectedLanguage,
                ActualLanguage = _actualLanguage,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnexpectedLanguageError value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("expectedLanguage");
            JsonSerializer.Serialize(writer, value.ExpectedLanguage, options);
            writer.WritePropertyName("actualLanguage");
            JsonSerializer.Serialize(writer, value.ActualLanguage, options);
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

        public override UnexpectedLanguageError ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UnexpectedLanguageError>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnexpectedLanguageError value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
