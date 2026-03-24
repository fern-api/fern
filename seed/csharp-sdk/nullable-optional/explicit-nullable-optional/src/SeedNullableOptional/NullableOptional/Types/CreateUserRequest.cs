using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;
using global::System.Text.Json;

namespace SeedNullableOptional;

[JsonConverter(typeof(CreateUserRequest.JsonConverter))][Serializable]
public record CreateUserRequest
{
    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [Nullable][JsonPropertyName("email")]
    public string? Email { get; set; }

    [Optional][JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [Nullable, Optional][JsonPropertyName("address")]
    public Optional<Address?> Address { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateUserRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) => typeof(CreateUserRequest).IsAssignableFrom(typeToConvert);

        public override CreateUserRequest? Read(ref Utf8JsonReader reader, global::System.Type typeToConvert, JsonSerializerOptions options) {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }
            
            string _username = default;
            string? _email = default;
            var _phone = string?.Undefined;
            var _address = Optional<Address?>.Undefined;
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
                        _username = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "email":
                        _email = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "phone":
                        _phone = string?.Of(JsonSerializer.Deserialize<string>(ref reader, options));
                        break;
                    case "address":
                        _address = Optional<Address?>.Of(JsonSerializer.Deserialize<Address?>(ref reader, options));
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }
            
            return new CreateUserRequest
            {
                Username = _username,
                Email = _email,
                Phone = _phone,
                Address = _address,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            }
;
        }

        public override void Write(Utf8JsonWriter writer, CreateUserRequest value, JsonSerializerOptions options) {
            writer.WriteStartObject();
            writer.WritePropertyName("username");
            JsonSerializer.Serialize(writer, value.Username, options);
            writer.WritePropertyName("email");
            JsonSerializer.Serialize(writer, value.Email, options);
            if (value.Phone.IsDefined)
            {
                writer.WritePropertyName("phone");
                JsonSerializer.Serialize(writer, value.Phone.Value, options);
            }
            if (value.Address.IsDefined)
            {
                writer.WritePropertyName("address");
                JsonSerializer.Serialize(writer, value.Address.Value, options);
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
