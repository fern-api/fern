using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedRequestParameters.Core;

namespace SeedRequestParameters;

[JsonConverter(typeof(CreateUsernameBodyOptionalProperties.JsonConverter))]
[Serializable]
public record CreateUsernameBodyOptionalProperties
{
    [Optional]
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [Optional]
    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [Optional]
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateUsernameBodyOptionalProperties>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CreateUsernameBodyOptionalProperties).IsAssignableFrom(typeToConvert);

        public override CreateUsernameBodyOptionalProperties? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _username = default;
            string? _password = default;
            string? _name = default;
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
                    case "username":
                        _username = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "password":
                        _password = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CreateUsernameBodyOptionalProperties
            {
                Username = _username,
                Password = _password,
                Name = _name,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateUsernameBodyOptionalProperties value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Username != null)
            {
                writer.WritePropertyName("username");
                JsonSerializer.Serialize(writer, value.Username, options);
            }
            if (value.Password != null)
            {
                writer.WritePropertyName("password");
                JsonSerializer.Serialize(writer, value.Password, options);
            }
            if (value.Name != null)
            {
                writer.WritePropertyName("name");
                JsonSerializer.Serialize(writer, value.Name, options);
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

        public override CreateUsernameBodyOptionalProperties ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<CreateUsernameBodyOptionalProperties>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CreateUsernameBodyOptionalProperties value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
