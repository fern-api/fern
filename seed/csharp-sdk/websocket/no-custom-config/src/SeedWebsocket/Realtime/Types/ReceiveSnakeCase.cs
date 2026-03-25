using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

[JsonConverter(typeof(ReceiveSnakeCase.JsonConverter))]
[Serializable]
public record ReceiveSnakeCase
{
    [JsonPropertyName("receive_text")]
    public required string ReceiveText { get; set; }

    [JsonPropertyName("receive_int")]
    public required int ReceiveInt { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ReceiveSnakeCase>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ReceiveSnakeCase).IsAssignableFrom(typeToConvert);

        public override ReceiveSnakeCase? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _receiveText = default;
            int _receiveInt = default;
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
                    case "receive_text":
                        _receiveText = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "receive_int":
                        _receiveInt = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ReceiveSnakeCase
            {
                ReceiveText = _receiveText,
                ReceiveInt = _receiveInt,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ReceiveSnakeCase value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("receive_text");
            JsonSerializer.Serialize(writer, value.ReceiveText, options);
            writer.WritePropertyName("receive_int");
            JsonSerializer.Serialize(writer, value.ReceiveInt, options);
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

        public override ReceiveSnakeCase ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ReceiveSnakeCase>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ReceiveSnakeCase value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
