using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocketAuth.Core;

namespace SeedWebsocketAuth;

[JsonConverter(typeof(SendEvent2.JsonConverter))]
[Serializable]
public record SendEvent2
{
    [JsonPropertyName("sendText2")]
    public required string SendText2 { get; set; }

    [JsonPropertyName("sendParam2")]
    public required bool SendParam2 { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SendEvent2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SendEvent2).IsAssignableFrom(typeToConvert);

        public override SendEvent2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _sendText2 = default;
            bool _sendParam2 = default;
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
                    case "sendText2":
                        _sendText2 = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "sendParam2":
                        _sendParam2 = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SendEvent2
            {
                SendText2 = _sendText2,
                SendParam2 = _sendParam2,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendEvent2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("sendText2");
            JsonSerializer.Serialize(writer, value.SendText2, options);
            writer.WritePropertyName("sendParam2");
            JsonSerializer.Serialize(writer, value.SendParam2, options);
            if (value.AdditionalProperties is not null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override SendEvent2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SendEvent2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SendEvent2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
