using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(TypeWithOptionalUnion.JsonConverter))]
[Serializable]
public record TypeWithOptionalUnion
{
    [JsonPropertyName("myUnion")]
    public MyUnion? MyUnion { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TypeWithOptionalUnion>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TypeWithOptionalUnion).IsAssignableFrom(typeToConvert);

        public override TypeWithOptionalUnion? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            MyUnion? _myUnion = default;
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
                    case "myUnion":
                        _myUnion = JsonSerializer.Deserialize<MyUnion?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TypeWithOptionalUnion
            {
                MyUnion = _myUnion,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TypeWithOptionalUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.MyUnion != null)
            {
                writer.WritePropertyName("myUnion");
                JsonSerializer.Serialize(writer, value.MyUnion, options);
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
