using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

/// <summary>
/// Admin user object
/// </summary>
[JsonConverter(typeof(Admin.JsonConverter))]
[Serializable]
public record Admin
{
    /// <summary>
    /// The level of admin privileges.
    /// </summary>
    [JsonPropertyName("adminLevel")]
    public required string AdminLevel { get; set; }

    /// <summary>
    /// The unique identifier for the user.
    /// </summary>
    [JsonAccess(JsonAccessType.ReadOnly)]
    [JsonPropertyName("id")]
    public string Id { get; set; }

    /// <summary>
    /// The email address of the user.
    /// </summary>
    [JsonAccess(JsonAccessType.ReadOnly)]
    [JsonPropertyName("email")]
    public string Email { get; set; }

    /// <summary>
    /// The password for the user.
    /// </summary>
    [JsonAccess(JsonAccessType.WriteOnly)]
    [JsonPropertyName("password")]
    public required string Password { get; set; }

    /// <summary>
    /// User profile object
    /// </summary>
    [JsonPropertyName("profile")]
    public required UserProfile Profile { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Admin>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Admin).IsAssignableFrom(typeToConvert);

        public override Admin? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _adminLevel = default;
            string _id = default;
            string _email = default;
            UserProfile _profile = default;
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
                    case "adminLevel":
                        _adminLevel = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "email":
                        _email = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "password":
                        reader.Skip();
                        break;
                    case "profile":
                        _profile = JsonSerializer.Deserialize<UserProfile>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Admin
            {
                AdminLevel = _adminLevel,
                Id = _id,
                Email = _email,
                Profile = _profile,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Admin value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("adminLevel");
            JsonSerializer.Serialize(writer, value.AdminLevel, options);
            writer.WritePropertyName("password");
            JsonSerializer.Serialize(writer, value.Password, options);
            writer.WritePropertyName("profile");
            JsonSerializer.Serialize(writer, value.Profile, options);
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
