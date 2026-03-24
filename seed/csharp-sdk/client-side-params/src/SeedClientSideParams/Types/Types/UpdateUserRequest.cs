using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[JsonConverter(typeof(UpdateUserRequest.JsonConverter))]
[Serializable]
public record UpdateUserRequest
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("email_verified")]
    public bool? EmailVerified { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("phone_verified")]
    public bool? PhoneVerified { get; set; }

    [JsonPropertyName("user_metadata")]
    public Dictionary<string, object?>? UserMetadata { get; set; }

    [JsonPropertyName("app_metadata")]
    public Dictionary<string, object?>? AppMetadata { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [JsonPropertyName("blocked")]
    public bool? Blocked { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UpdateUserRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UpdateUserRequest).IsAssignableFrom(typeToConvert);

        public override UpdateUserRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _email = default;
            bool? _emailVerified = default;
            string? _username = default;
            string? _phoneNumber = default;
            bool? _phoneVerified = default;
            Dictionary<string, object?>? _userMetadata = default;
            Dictionary<string, object?>? _appMetadata = default;
            string? _password = default;
            bool? _blocked = default;
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
                    case "email":
                        _email = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "email_verified":
                        _emailVerified = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "username":
                        _username = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "phone_number":
                        _phoneNumber = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "phone_verified":
                        _phoneVerified = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "user_metadata":
                        _userMetadata = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "app_metadata":
                        _appMetadata = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "password":
                        _password = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "blocked":
                        _blocked = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UpdateUserRequest
            {
                Email = _email,
                EmailVerified = _emailVerified,
                Username = _username,
                PhoneNumber = _phoneNumber,
                PhoneVerified = _phoneVerified,
                UserMetadata = _userMetadata,
                AppMetadata = _appMetadata,
                Password = _password,
                Blocked = _blocked,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UpdateUserRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Email != null)
            {
                writer.WritePropertyName("email");
                JsonSerializer.Serialize(writer, value.Email, options);
            }
            if (value.EmailVerified != null)
            {
                writer.WritePropertyName("email_verified");
                JsonSerializer.Serialize(writer, value.EmailVerified, options);
            }
            if (value.Username != null)
            {
                writer.WritePropertyName("username");
                JsonSerializer.Serialize(writer, value.Username, options);
            }
            if (value.PhoneNumber != null)
            {
                writer.WritePropertyName("phone_number");
                JsonSerializer.Serialize(writer, value.PhoneNumber, options);
            }
            if (value.PhoneVerified != null)
            {
                writer.WritePropertyName("phone_verified");
                JsonSerializer.Serialize(writer, value.PhoneVerified, options);
            }
            if (value.UserMetadata != null)
            {
                writer.WritePropertyName("user_metadata");
                JsonSerializer.Serialize(writer, value.UserMetadata, options);
            }
            if (value.AppMetadata != null)
            {
                writer.WritePropertyName("app_metadata");
                JsonSerializer.Serialize(writer, value.AppMetadata, options);
            }
            if (value.Password != null)
            {
                writer.WritePropertyName("password");
                JsonSerializer.Serialize(writer, value.Password, options);
            }
            if (value.Blocked != null)
            {
                writer.WritePropertyName("blocked");
                JsonSerializer.Serialize(writer, value.Blocked, options);
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

        public override UpdateUserRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UpdateUserRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UpdateUserRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
