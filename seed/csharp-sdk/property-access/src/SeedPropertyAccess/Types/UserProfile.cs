using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

/// <summary>
/// User profile object
/// </summary>
[JsonConverter(typeof(UserProfile.JsonConverter))]
[Serializable]
public record UserProfile
{
    /// <summary>
    /// The name of the user.
    /// </summary>
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// User profile verification object
    /// </summary>
    [JsonPropertyName("verification")]
    public required UserProfileVerification Verification { get; set; }

    /// <summary>
    /// The social security number of the user.
    /// </summary>
    [JsonAccess(JsonAccessType.WriteOnly)]
    [JsonPropertyName("ssn")]
    public required string Ssn { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UserProfile>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserProfile).IsAssignableFrom(typeToConvert);

        public override UserProfile? Read(
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
            UserProfileVerification _verification = default;
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
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "verification":
                        _verification = JsonSerializer.Deserialize<UserProfileVerification>(
                            ref reader,
                            options
                        );
                        break;
                    case "ssn":
                        reader.Skip();
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UserProfile
            {
                Name = _name,
                Verification = _verification,
                Ssn = default!,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserProfile value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("verification");
            JsonSerializer.Serialize(writer, value.Verification, options);
            if (value.Ssn != null)
            {
                writer.WritePropertyName("ssn");
                JsonSerializer.Serialize(writer, value.Ssn, options);
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

        public override UserProfile ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UserProfile>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserProfile value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
