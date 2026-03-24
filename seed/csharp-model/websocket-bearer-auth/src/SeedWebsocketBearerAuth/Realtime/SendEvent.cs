using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth;

[JsonConverter(typeof(SendEvent.JsonConverter))]
[Serializable]
public record SendEvent
{
    [JsonPropertyName("sendText")]
    public required string SendText { get; set; }

    [JsonPropertyName("sendParam")]
    public required int SendParam { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SendEvent>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SendEvent).IsAssignableFrom(typeToConvert);

        public override SendEvent? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _sendText = default;
            int _sendParam = default;
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
                    case "sendText":
                        _sendText = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "sendParam":
                        _sendParam = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SendEvent
            {
                SendText = _sendText,
                SendParam = _sendParam,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("sendText");
            JsonSerializer.Serialize(writer, value.SendText, options);
            writer.WritePropertyName("sendParam");
            JsonSerializer.Serialize(writer, value.SendParam, options);
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

        public override SendEvent ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SendEvent>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SendEvent value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
