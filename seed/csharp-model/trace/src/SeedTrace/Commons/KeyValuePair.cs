using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(KeyValuePair.JsonConverter))]
[Serializable]
public record KeyValuePair
{
    [JsonPropertyName("key")]
    public required VariableValue Key { get; set; }

    [JsonPropertyName("value")]
    public required VariableValue Value { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<KeyValuePair>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(KeyValuePair).IsAssignableFrom(typeToConvert);

        public override KeyValuePair? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            VariableValue _key = default;
            VariableValue _value = default;
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
                    case "key":
                        _key = JsonSerializer.Deserialize<VariableValue>(ref reader, options);
                        break;
                    case "value":
                        _value = JsonSerializer.Deserialize<VariableValue>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new KeyValuePair
            {
                Key = _key,
                Value = _value,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            KeyValuePair value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("key");
            JsonSerializer.Serialize(writer, value.Key, options);
            writer.WritePropertyName("value");
            JsonSerializer.Serialize(writer, value.Value, options);
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

        public override KeyValuePair ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<KeyValuePair>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            KeyValuePair value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
