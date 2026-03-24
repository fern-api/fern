using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ListType.JsonConverter))]
[Serializable]
public record ListType
{
    [JsonPropertyName("valueType")]
    public required VariableType ValueType { get; set; }

    /// <summary>
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    /// </summary>
    [JsonPropertyName("isFixedLength")]
    public bool? IsFixedLength { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ListType>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ListType).IsAssignableFrom(typeToConvert);

        public override ListType? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            VariableType _valueType = default;
            bool? _isFixedLength = default;
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
                    case "valueType":
                        _valueType = JsonSerializer.Deserialize<VariableType>(ref reader, options);
                        break;
                    case "isFixedLength":
                        _isFixedLength = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ListType
            {
                ValueType = _valueType,
                IsFixedLength = _isFixedLength,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ListType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("valueType");
            JsonSerializer.Serialize(writer, value.ValueType, options);
            if (value.IsFixedLength != null)
            {
                writer.WritePropertyName("isFixedLength");
                JsonSerializer.Serialize(writer, value.IsFixedLength, options);
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
