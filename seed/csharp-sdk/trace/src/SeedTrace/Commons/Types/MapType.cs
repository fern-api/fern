using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(MapType.JsonConverter))]
[Serializable]
public record MapType
{
    [JsonPropertyName("keyType")]
    public required VariableType KeyType { get; set; }

    [JsonPropertyName("valueType")]
    public required VariableType ValueType { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<MapType>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(MapType).IsAssignableFrom(typeToConvert);

        public override MapType? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            VariableType _keyType = default;
            VariableType _valueType = default;
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
                    case "keyType":
                        _keyType = JsonSerializer.Deserialize<VariableType>(ref reader, options);
                        break;
                    case "valueType":
                        _valueType = JsonSerializer.Deserialize<VariableType>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new MapType
            {
                KeyType = _keyType,
                ValueType = _valueType,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            MapType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("keyType");
            JsonSerializer.Serialize(writer, value.KeyType, options);
            writer.WritePropertyName("valueType");
            JsonSerializer.Serialize(writer, value.ValueType, options);
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
