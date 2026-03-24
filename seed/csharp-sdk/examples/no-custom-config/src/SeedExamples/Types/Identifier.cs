using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(Identifier.JsonConverter))]
[Serializable]
public record Identifier
{
    [JsonPropertyName("type")]
    public required OneOf<BasicType, ComplexType> Type { get; set; }

    [JsonPropertyName("value")]
    public required string Value { get; set; }

    [JsonPropertyName("label")]
    public required string Label { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Identifier>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Identifier).IsAssignableFrom(typeToConvert);

        public override Identifier? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            OneOf<BasicType, ComplexType> _type = default;
            string _value = default;
            string _label = default;
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
                    case "type":
                        _type = JsonSerializer.Deserialize<OneOf<BasicType, ComplexType>>(
                            ref reader,
                            options
                        );
                        break;
                    case "value":
                        _value = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "label":
                        _label = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Identifier
            {
                Type = _type,
                Value = _value,
                Label = _label,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Identifier value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("type");
            JsonSerializer.Serialize(writer, value.Type, options);
            writer.WritePropertyName("value");
            JsonSerializer.Serialize(writer, value.Value, options);
            writer.WritePropertyName("label");
            JsonSerializer.Serialize(writer, value.Label, options);
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
