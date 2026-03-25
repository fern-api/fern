using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[JsonConverter(typeof(CreateUserRequest.JsonConverter))]
[Serializable]
public record CreateUserRequest
{
    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("email_verified")]
    public bool? EmailVerified { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("phone_verified")]
    public bool? PhoneVerified { get; set; }

    [JsonPropertyName("user_metadata")]
    public Dictionary<string, object?>? UserMetadata { get; set; }

    [JsonPropertyName("app_metadata")]
    public Dictionary<string, object?>? AppMetadata { get; set; }

    [JsonPropertyName("connection")]
    public required string Connection { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateUserRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CreateUserRequest).IsAssignableFrom(typeToConvert);

        public override CreateUserRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _email = default;
            bool? _emailVerified = default;
            string? _username = default;
            string? _password = default;
            string? _phoneNumber = default;
            bool? _phoneVerified = default;
            Dictionary<string, object?>? _userMetadata = default;
            Dictionary<string, object?>? _appMetadata = default;
            string _connection = default;
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
                        _email = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "email_verified":
                        _emailVerified = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "username":
                        _username = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "password":
                        _password = JsonSerializer.Deserialize<string?>(ref reader, options);
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
                    case "connection":
                        _connection = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CreateUserRequest
            {
                Email = _email,
                EmailVerified = _emailVerified,
                Username = _username,
                Password = _password,
                PhoneNumber = _phoneNumber,
                PhoneVerified = _phoneVerified,
                UserMetadata = _userMetadata,
                AppMetadata = _appMetadata,
                Connection = _connection,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateUserRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("email");
            JsonSerializer.Serialize(writer, value.Email, options);
            if (value.EmailVerified is not null)
            {
                writer.WritePropertyName("email_verified");
                JsonSerializer.Serialize(writer, value.EmailVerified, options);
            }
            if (value.Username is not null)
            {
                writer.WritePropertyName("username");
                JsonSerializer.Serialize(writer, value.Username, options);
            }
            if (value.Password is not null)
            {
                writer.WritePropertyName("password");
                JsonSerializer.Serialize(writer, value.Password, options);
            }
            if (value.PhoneNumber is not null)
            {
                writer.WritePropertyName("phone_number");
                JsonSerializer.Serialize(writer, value.PhoneNumber, options);
            }
            if (value.PhoneVerified is not null)
            {
                writer.WritePropertyName("phone_verified");
                JsonSerializer.Serialize(writer, value.PhoneVerified, options);
            }
            if (value.UserMetadata is not null)
            {
                writer.WritePropertyName("user_metadata");
                JsonSerializer.Serialize(writer, value.UserMetadata, options);
            }
            if (value.AppMetadata is not null)
            {
                writer.WritePropertyName("app_metadata");
                JsonSerializer.Serialize(writer, value.AppMetadata, options);
            }
            writer.WritePropertyName("connection");
            JsonSerializer.Serialize(writer, value.Connection, options);
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

        public override CreateUserRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<CreateUserRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CreateUserRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
