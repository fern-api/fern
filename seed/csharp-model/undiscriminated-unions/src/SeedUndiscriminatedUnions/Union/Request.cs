using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(Request.JsonConverter))]
[Serializable]
public record Request
{
    [JsonPropertyName("union")]
    public OneOf<Dictionary<string, object?>?, NamedMetadata>? Union { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Request>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Request).IsAssignableFrom(typeToConvert);

        public override Request? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            OneOf<Dictionary<string, object?>?, NamedMetadata>? _union = default;
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
                    case "union":
                        _union = JsonSerializer.Deserialize<OneOf<
                            Dictionary<string, object?>?,
                            NamedMetadata
                        >?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Request
            {
                Union = _union,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Request value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Union is not null)
            {
                writer.WritePropertyName("union");
                JsonSerializer.Serialize(writer, value.Union, options);
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

        public override Request ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Request>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Request value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
