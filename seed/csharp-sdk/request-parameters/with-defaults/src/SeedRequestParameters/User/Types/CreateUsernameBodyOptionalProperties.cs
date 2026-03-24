using global::System.Text.Json.Serialization;
using SeedRequestParameters.Core;
using global::System.Text.Json;

namespace SeedRequestParameters;

[JsonConverter(typeof(CreateUsernameBodyOptionalProperties.JsonConverter))][Serializable]
public record CreateUsernameBodyOptionalProperties
{
    [Optional][JsonPropertyName("username")]
    public string? Username { get; set; }

    [Optional][JsonPropertyName("password")]
    public string? Password { get; set; }

    [Optional][JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateUsernameBodyOptionalProperties>
    {
        public override bool CanConvert(global::System.Type typeToConvert) => typeof(CreateUsernameBodyOptionalProperties).IsAssignableFrom(typeToConvert);

        public override CreateUsernameBodyOptionalProperties? Read(ref Utf8JsonReader reader, global::System.Type typeToConvert, JsonSerializerOptions options) {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }
            
            var _username = string?.Undefined;
            var _password = string?.Undefined;
            var _name = string?.Undefined;
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
                        _username = string?.Of(JsonSerializer.Deserialize<string>(ref reader, options));
                        break;
                    case "password":
                        _password = string?.Of(JsonSerializer.Deserialize<string>(ref reader, options));
                        break;
                    case "name":
                        _name = string?.Of(JsonSerializer.Deserialize<string>(ref reader, options));
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
            }
;
        }

        public override void Write(Utf8JsonWriter writer, CreateUsernameBodyOptionalProperties value, JsonSerializerOptions options) {
            writer.WriteStartObject();
            if (value.Username.IsDefined)
            {
                writer.WritePropertyName("username");
                JsonSerializer.Serialize(writer, value.Username.Value, options);
            }
            if (value.Password.IsDefined)
            {
                writer.WritePropertyName("password");
                JsonSerializer.Serialize(writer, value.Password.Value, options);
            }
            if (value.Name.IsDefined)
            {
                writer.WritePropertyName("name");
                JsonSerializer.Serialize(writer, value.Name.Value, options);
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
