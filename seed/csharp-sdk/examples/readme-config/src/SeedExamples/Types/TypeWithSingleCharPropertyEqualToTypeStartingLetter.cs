using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(TypeWithSingleCharPropertyEqualToTypeStartingLetter.JsonConverter))]
[Serializable]
public record TypeWithSingleCharPropertyEqualToTypeStartingLetter
{
    [JsonPropertyName("t")]
    public required string T { get; set; }

    [JsonPropertyName("ty")]
    public required string Ty { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter
        : JsonConverter<TypeWithSingleCharPropertyEqualToTypeStartingLetter>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TypeWithSingleCharPropertyEqualToTypeStartingLetter).IsAssignableFrom(
                typeToConvert
            );

        public override TypeWithSingleCharPropertyEqualToTypeStartingLetter? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _t = default;
            string _ty = default;
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
                    case "t":
                        _t = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "ty":
                        _ty = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TypeWithSingleCharPropertyEqualToTypeStartingLetter
            {
                T = _t,
                Ty = _ty,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TypeWithSingleCharPropertyEqualToTypeStartingLetter value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("t");
            JsonSerializer.Serialize(writer, value.T, options);
            writer.WritePropertyName("ty");
            JsonSerializer.Serialize(writer, value.Ty, options);
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
