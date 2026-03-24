using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// User object similar to Auth0 users
/// </summary>
[JsonConverter(typeof(User.JsonConverter))]
[Serializable]
public record User
{
    [JsonPropertyName("user_id")]
    public required string UserId { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("email_verified")]
    public required bool EmailVerified { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("phone_verified")]
    public bool? PhoneVerified { get; set; }

    [JsonPropertyName("created_at")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public required DateTime UpdatedAt { get; set; }

    [JsonPropertyName("identities")]
    public IEnumerable<Identity>? Identities { get; set; }

    [JsonPropertyName("app_metadata")]
    public Dictionary<string, object?>? AppMetadata { get; set; }

    [JsonPropertyName("user_metadata")]
    public Dictionary<string, object?>? UserMetadata { get; set; }

    [JsonPropertyName("picture")]
    public string? Picture { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("nickname")]
    public string? Nickname { get; set; }

    [JsonPropertyName("multifactor")]
    public IEnumerable<string>? Multifactor { get; set; }

    [JsonPropertyName("last_ip")]
    public string? LastIp { get; set; }

    [JsonPropertyName("last_login")]
    public DateTime? LastLogin { get; set; }

    [JsonPropertyName("logins_count")]
    public int? LoginsCount { get; set; }

    [JsonPropertyName("blocked")]
    public bool? Blocked { get; set; }

    [JsonPropertyName("given_name")]
    public string? GivenName { get; set; }

    [JsonPropertyName("family_name")]
    public string? FamilyName { get; set; }

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

            string _userId = default;
            string _email = default;
            bool _emailVerified = default;
            string? _username = default;
            string? _phoneNumber = default;
            bool? _phoneVerified = default;
            DateTime _createdAt = default;
            DateTime _updatedAt = default;
            IEnumerable<Identity>? _identities = default;
            Dictionary<string, object?>? _appMetadata = default;
            Dictionary<string, object?>? _userMetadata = default;
            string? _picture = default;
            string? _name = default;
            string? _nickname = default;
            IEnumerable<string>? _multifactor = default;
            string? _lastIp = default;
            DateTime? _lastLogin = default;
            int? _loginsCount = default;
            bool? _blocked = default;
            string? _givenName = default;
            string? _familyName = default;
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
                    case "user_id":
                        _userId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "email":
                        _email = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "email_verified":
                        _emailVerified = JsonSerializer.Deserialize<bool>(ref reader, options);
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
                    case "created_at":
                        _createdAt = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "updated_at":
                        _updatedAt = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "identities":
                        _identities = JsonSerializer.Deserialize<IEnumerable<Identity>?>(
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
                    case "user_metadata":
                        _userMetadata = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "picture":
                        _picture = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "nickname":
                        _nickname = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "multifactor":
                        _multifactor = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "last_ip":
                        _lastIp = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "last_login":
                        _lastLogin = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "logins_count":
                        _loginsCount = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "blocked":
                        _blocked = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "given_name":
                        _givenName = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "family_name":
                        _familyName = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new User
            {
                UserId = _userId,
                Email = _email,
                EmailVerified = _emailVerified,
                Username = _username,
                PhoneNumber = _phoneNumber,
                PhoneVerified = _phoneVerified,
                CreatedAt = _createdAt,
                UpdatedAt = _updatedAt,
                Identities = _identities,
                AppMetadata = _appMetadata,
                UserMetadata = _userMetadata,
                Picture = _picture,
                Name = _name,
                Nickname = _nickname,
                Multifactor = _multifactor,
                LastIp = _lastIp,
                LastLogin = _lastLogin,
                LoginsCount = _loginsCount,
                Blocked = _blocked,
                GivenName = _givenName,
                FamilyName = _familyName,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, User value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("user_id");
            JsonSerializer.Serialize(writer, value.UserId, options);
            writer.WritePropertyName("email");
            JsonSerializer.Serialize(writer, value.Email, options);
            writer.WritePropertyName("email_verified");
            JsonSerializer.Serialize(writer, value.EmailVerified, options);
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
            writer.WritePropertyName("created_at");
            JsonSerializer.Serialize(writer, value.CreatedAt, options);
            writer.WritePropertyName("updated_at");
            JsonSerializer.Serialize(writer, value.UpdatedAt, options);
            if (value.Identities != null)
            {
                writer.WritePropertyName("identities");
                JsonSerializer.Serialize(writer, value.Identities, options);
            }
            if (value.AppMetadata != null)
            {
                writer.WritePropertyName("app_metadata");
                JsonSerializer.Serialize(writer, value.AppMetadata, options);
            }
            if (value.UserMetadata != null)
            {
                writer.WritePropertyName("user_metadata");
                JsonSerializer.Serialize(writer, value.UserMetadata, options);
            }
            if (value.Picture != null)
            {
                writer.WritePropertyName("picture");
                JsonSerializer.Serialize(writer, value.Picture, options);
            }
            if (value.Name != null)
            {
                writer.WritePropertyName("name");
                JsonSerializer.Serialize(writer, value.Name, options);
            }
            if (value.Nickname != null)
            {
                writer.WritePropertyName("nickname");
                JsonSerializer.Serialize(writer, value.Nickname, options);
            }
            if (value.Multifactor != null)
            {
                writer.WritePropertyName("multifactor");
                JsonSerializer.Serialize(writer, value.Multifactor, options);
            }
            if (value.LastIp != null)
            {
                writer.WritePropertyName("last_ip");
                JsonSerializer.Serialize(writer, value.LastIp, options);
            }
            if (value.LastLogin != null)
            {
                writer.WritePropertyName("last_login");
                JsonSerializer.Serialize(writer, value.LastLogin, options);
            }
            if (value.LoginsCount != null)
            {
                writer.WritePropertyName("logins_count");
                JsonSerializer.Serialize(writer, value.LoginsCount, options);
            }
            if (value.Blocked != null)
            {
                writer.WritePropertyName("blocked");
                JsonSerializer.Serialize(writer, value.Blocked, options);
            }
            if (value.GivenName != null)
            {
                writer.WritePropertyName("given_name");
                JsonSerializer.Serialize(writer, value.GivenName, options);
            }
            if (value.FamilyName != null)
            {
                writer.WritePropertyName("family_name");
                JsonSerializer.Serialize(writer, value.FamilyName, options);
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
