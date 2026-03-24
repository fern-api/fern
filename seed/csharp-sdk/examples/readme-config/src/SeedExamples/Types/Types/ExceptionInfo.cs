using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(ExceptionInfo.JsonConverter))]
[Serializable]
public record ExceptionInfo
{
    [JsonPropertyName("exceptionType")]
    public required string ExceptionType { get; set; }

    [JsonPropertyName("exceptionMessage")]
    public required string ExceptionMessage { get; set; }

    [JsonPropertyName("exceptionStacktrace")]
    public required string ExceptionStacktrace { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ExceptionInfo>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ExceptionInfo).IsAssignableFrom(typeToConvert);

        public override ExceptionInfo? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _exceptionType = default;
            string _exceptionMessage = default;
            string _exceptionStacktrace = default;
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
                    case "exceptionType":
                        _exceptionType = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "exceptionMessage":
                        _exceptionMessage = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "exceptionStacktrace":
                        _exceptionStacktrace = JsonSerializer.Deserialize<string>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ExceptionInfo
            {
                ExceptionType = _exceptionType,
                ExceptionMessage = _exceptionMessage,
                ExceptionStacktrace = _exceptionStacktrace,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ExceptionInfo value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("exceptionType");
            JsonSerializer.Serialize(writer, value.ExceptionType, options);
            writer.WritePropertyName("exceptionMessage");
            JsonSerializer.Serialize(writer, value.ExceptionMessage, options);
            writer.WritePropertyName("exceptionStacktrace");
            JsonSerializer.Serialize(writer, value.ExceptionStacktrace, options);
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

        public override ExceptionInfo ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ExceptionInfo>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ExceptionInfo value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
