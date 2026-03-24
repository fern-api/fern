using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(PushNotification.JsonConverter))]
[Serializable]
public record PushNotification
{
    [JsonPropertyName("deviceToken")]
    public required string DeviceToken { get; set; }

    [JsonPropertyName("title")]
    public required string Title { get; set; }

    [JsonPropertyName("body")]
    public required string Body { get; set; }

    [JsonPropertyName("badge")]
    public int? Badge { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PushNotification>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PushNotification).IsAssignableFrom(typeToConvert);

        public override PushNotification? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _deviceToken = default;
            string _title = default;
            string _body = default;
            int? _badge = default;
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
                    case "deviceToken":
                        _deviceToken = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "title":
                        _title = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "body":
                        _body = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "badge":
                        _badge = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PushNotification
            {
                DeviceToken = _deviceToken,
                Title = _title,
                Body = _body,
                Badge = _badge,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PushNotification value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("deviceToken");
            JsonSerializer.Serialize(writer, value.DeviceToken, options);
            writer.WritePropertyName("title");
            JsonSerializer.Serialize(writer, value.Title, options);
            writer.WritePropertyName("body");
            JsonSerializer.Serialize(writer, value.Body, options);
            if (value.Badge != null)
            {
                writer.WritePropertyName("badge");
                JsonSerializer.Serialize(writer, value.Badge, options);
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
    }
}
