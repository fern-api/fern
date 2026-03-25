using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocketAuth.Core;

namespace SeedWebsocketAuth;

[JsonConverter(typeof(SendSnakeCase.JsonConverter))]
[Serializable]
public record SendSnakeCase
{
    [JsonPropertyName("send_text")]
    public required string SendText { get; set; }

    [JsonPropertyName("send_param")]
    public required int SendParam { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SendSnakeCase>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SendSnakeCase).IsAssignableFrom(typeToConvert);

        public override SendSnakeCase? Read(
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
                    case "send_text":
                        _sendText = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "send_param":
                        _sendParam = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SendSnakeCase
            {
                SendText = _sendText,
                SendParam = _sendParam,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendSnakeCase value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("send_text");
            JsonSerializer.Serialize(writer, value.SendText, options);
            writer.WritePropertyName("send_param");
            JsonSerializer.Serialize(writer, value.SendParam, options);
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

        public override SendSnakeCase ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SendSnakeCase>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SendSnakeCase value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
