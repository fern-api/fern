using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Object inheriting from a nullable schema via allOf.
/// </summary>
[JsonConverter(typeof(RootObject.JsonConverter))]
[Serializable]
public record RootObject
{
    [JsonPropertyName("normalField")]
    public string? NormalField { get; set; }

    [JsonPropertyName("nullableField")]
    public string? NullableField { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<RootObject>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(RootObject).IsAssignableFrom(typeToConvert);

        public override RootObject? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _normalField = default;
            string? _nullableField = default;
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
                    case "normalField":
                        _normalField = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "nullableField":
                        _nullableField = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new RootObject
            {
                NormalField = _normalField,
                NullableField = _nullableField,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            RootObject value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.NormalField != null)
            {
                writer.WritePropertyName("normalField");
                JsonSerializer.Serialize(writer, value.NormalField, options);
            }
            if (value.NullableField != null)
            {
                writer.WritePropertyName("nullableField");
                JsonSerializer.Serialize(writer, value.NullableField, options);
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
