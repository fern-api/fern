using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExtraProperties.Core;

namespace SeedExtraProperties;

[JsonConverter(typeof(User.JsonConverter))]
[Serializable]
public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonIgnore]
    public AdditionalProperties AdditionalProperties { get; set; } = new();

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

            string _name = default;
            var extensionData = new Dictionary<string, object?>();

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
                    default:
                        if (reader.TokenType == JsonTokenType.Null)
                        {
                            extensionData[propertyName!] = null;
                        }
                        else
                        {
                            extensionData[propertyName!] = JsonSerializer.Deserialize<object>(
                                ref reader,
                                options
                            );
                        }
                        break;
                }
            }

            return new User
            {
                Name = _name,
                AdditionalProperties = new AdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, User value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            if (value.AdditionalProperties != null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    JsonSerializer.Serialize(writer, kvp.Value, options);
                }
            }
            writer.WriteEndObject();
        }

        public override User ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<User>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            User value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
