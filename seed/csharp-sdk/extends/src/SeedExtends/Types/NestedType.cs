using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

[JsonConverter(typeof(NestedType.JsonConverter))]
[Serializable]
public record NestedType
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("raw")]
    public required string Raw { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedType>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NestedType).IsAssignableFrom(typeToConvert);

        public override NestedType? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _name = default;
            string _raw = default;
            string _docs = default;
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
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "raw":
                        _raw = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "docs":
                        _docs = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NestedType
            {
                Name = _name,
                Raw = _raw,
                Docs = _docs,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("raw");
            JsonSerializer.Serialize(writer, value.Raw, options);
            writer.WritePropertyName("docs");
            JsonSerializer.Serialize(writer, value.Docs, options);
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

        public override NestedType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<NestedType>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedType value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
