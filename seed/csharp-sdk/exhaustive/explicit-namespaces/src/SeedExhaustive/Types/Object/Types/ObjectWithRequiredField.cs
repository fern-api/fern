using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

[JsonConverter(typeof(ObjectWithRequiredField.JsonConverter))]
[Serializable]
public record ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ObjectWithRequiredField>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ObjectWithRequiredField).IsAssignableFrom(typeToConvert);

        public override ObjectWithRequiredField? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _string = default;
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
                        _string = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ObjectWithRequiredField
            {
                String = _string,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ObjectWithRequiredField value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("string");
            JsonSerializer.Serialize(writer, value.String, options);
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
