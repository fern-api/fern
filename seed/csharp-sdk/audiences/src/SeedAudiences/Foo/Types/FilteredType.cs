using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences;

[JsonConverter(typeof(FilteredType.JsonConverter))]
[Serializable]
public record FilteredType
{
    [JsonPropertyName("public_property")]
    public string? PublicProperty { get; set; }

    [JsonPropertyName("private_property")]
    public required int PrivateProperty { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<FilteredType>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(FilteredType).IsAssignableFrom(typeToConvert);

        public override FilteredType? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _publicProperty = default;
            int _privateProperty = default;
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
                    case "public_property":
                        _publicProperty = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "private_property":
                        _privateProperty = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new FilteredType
            {
                PublicProperty = _publicProperty,
                PrivateProperty = _privateProperty,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            FilteredType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.PublicProperty != null)
            {
                writer.WritePropertyName("public_property");
                JsonSerializer.Serialize(writer, value.PublicProperty, options);
            }
            writer.WritePropertyName("private_property");
            JsonSerializer.Serialize(writer, value.PrivateProperty, options);
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
