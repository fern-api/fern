using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

[JsonConverter(typeof(User.JsonConverter))]
[Serializable]
public record User
{
    [JsonPropertyName("userName")]
    public required string UserName { get; set; }

    [JsonPropertyName("metadata_tags")]
    public IEnumerable<string> MetadataTags { get; set; } = new List<string>();

    [JsonPropertyName("EXTRA_PROPERTIES")]
    public Dictionary<string, string> ExtraProperties { get; set; } =
        new Dictionary<string, string>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<User>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(User).IsAssignableFrom(typeToConvert);

        public override User? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _userName = default;
            IEnumerable<string> _metadataTags = default;
            Dictionary<string, string> _extraProperties = default;
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
                    case "userName":
                        _userName = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "metadata_tags":
                        _metadataTags = JsonSerializer.Deserialize<IEnumerable<string>>(
                            ref reader,
                            options
                        );
                        break;
                    case "EXTRA_PROPERTIES":
                        _extraProperties = JsonSerializer.Deserialize<Dictionary<string, string>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new User
            {
                UserName = _userName,
                MetadataTags = _metadataTags,
                ExtraProperties = _extraProperties,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, User value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("userName");
            JsonSerializer.Serialize(writer, value.UserName, options);
            writer.WritePropertyName("metadata_tags");
            JsonSerializer.Serialize(writer, value.MetadataTags, options);
            writer.WritePropertyName("EXTRA_PROPERTIES");
            JsonSerializer.Serialize(writer, value.ExtraProperties, options);
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
