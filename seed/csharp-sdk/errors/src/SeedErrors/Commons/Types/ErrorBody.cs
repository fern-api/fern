using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedErrors.Core;

namespace SeedErrors;

[JsonConverter(typeof(ErrorBody.JsonConverter))]
[Serializable]
public record ErrorBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    [JsonPropertyName("code")]
    public required int Code { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ErrorBody>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ErrorBody).IsAssignableFrom(typeToConvert);

        public override ErrorBody? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _message = default;
            int _code = default;
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
                    case "message":
                        _message = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "code":
                        _code = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ErrorBody
            {
                Message = _message,
                Code = _code,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ErrorBody value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("message");
            JsonSerializer.Serialize(writer, value.Message, options);
            writer.WritePropertyName("code");
            JsonSerializer.Serialize(writer, value.Code, options);
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

        public override ErrorBody ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ErrorBody>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ErrorBody value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
