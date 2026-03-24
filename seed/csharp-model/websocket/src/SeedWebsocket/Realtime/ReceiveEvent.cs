using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

[JsonConverter(typeof(ReceiveEvent.JsonConverter))]
[Serializable]
public record ReceiveEvent
{
    [JsonPropertyName("alpha")]
    public required string Alpha { get; set; }

    [JsonPropertyName("beta")]
    public required int Beta { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ReceiveEvent>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ReceiveEvent).IsAssignableFrom(typeToConvert);

        public override ReceiveEvent? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _alpha = default;
            int _beta = default;
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
                    case "alpha":
                        _alpha = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "beta":
                        _beta = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ReceiveEvent
            {
                Alpha = _alpha,
                Beta = _beta,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ReceiveEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("alpha");
            JsonSerializer.Serialize(writer, value.Alpha, options);
            writer.WritePropertyName("beta");
            JsonSerializer.Serialize(writer, value.Beta, options);
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
