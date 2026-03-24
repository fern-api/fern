using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

[JsonConverter(typeof(ErrorEvent.JsonConverter))]
[Serializable]
public record ErrorEvent
{
    [JsonPropertyName("error")]
    public required string Error { get; set; }

    [JsonPropertyName("code")]
    public int? Code { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ErrorEvent>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ErrorEvent).IsAssignableFrom(typeToConvert);

        public override ErrorEvent? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _error = default;
            int? _code = default;
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
                    case "error":
                        _error = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "code":
                        _code = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ErrorEvent
            {
                Error = _error,
                Code = _code,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ErrorEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("error");
            JsonSerializer.Serialize(writer, value.Error, options);
            if (value.Code != null)
            {
                writer.WritePropertyName("code");
                JsonSerializer.Serialize(writer, value.Code, options);
            }
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

        public override ErrorEvent ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ErrorEvent>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ErrorEvent value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
