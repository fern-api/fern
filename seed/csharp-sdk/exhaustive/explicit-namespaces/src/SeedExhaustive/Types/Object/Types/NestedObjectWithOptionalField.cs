using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

[JsonConverter(typeof(NestedObjectWithOptionalField.JsonConverter))]
[Serializable]
public record NestedObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public string? String { get; set; }

    [JsonPropertyName("NestedObject")]
    public ObjectWithOptionalField? NestedObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedObjectWithOptionalField>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NestedObjectWithOptionalField).IsAssignableFrom(typeToConvert);

        public override NestedObjectWithOptionalField? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _string = default;
            ObjectWithOptionalField? _nestedObject = default;
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
                    case "string":
                        _string = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "NestedObject":
                        _nestedObject = JsonSerializer.Deserialize<ObjectWithOptionalField?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NestedObjectWithOptionalField
            {
                String = _string,
                NestedObject = _nestedObject,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithOptionalField value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.String is not null)
            {
                writer.WritePropertyName("string");
                JsonSerializer.Serialize(writer, value.String, options);
            }
            if (value.NestedObject is not null)
            {
                writer.WritePropertyName("NestedObject");
                JsonSerializer.Serialize(writer, value.NestedObject, options);
            }
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

        public override NestedObjectWithOptionalField ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<NestedObjectWithOptionalField>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedObjectWithOptionalField value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
