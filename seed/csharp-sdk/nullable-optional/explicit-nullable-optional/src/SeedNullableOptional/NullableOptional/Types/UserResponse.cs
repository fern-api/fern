using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(UserResponse.JsonConverter))]
[Serializable]
public record UserResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [Nullable]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [Optional]
    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; set; }

    [Nullable]
    [JsonPropertyName("updatedAt")]
    public DateTime? UpdatedAt { get; set; }

    [Optional]
    [JsonPropertyName("address")]
    public Address? Address { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UserResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserResponse).IsAssignableFrom(typeToConvert);

        public override UserResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _id = default;
            string _username = default;
            string? _email = default;
            string? _phone = default;
            DateTime _createdAt = default;
            DateTime? _updatedAt = default;
            Address? _address = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "username":
                        _username = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "email":
                        _email = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "phone":
                        _phone = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "createdAt":
                        _createdAt = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "updatedAt":
                        _updatedAt = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "address":
                        _address = JsonSerializer.Deserialize<Address?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UserResponse
            {
                Id = _id,
                Username = _username,
                Email = _email,
                Phone = _phone,
                CreatedAt = _createdAt,
                UpdatedAt = _updatedAt,
                Address = _address,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            writer.WritePropertyName("username");
            JsonSerializer.Serialize(writer, value.Username, options);
            writer.WritePropertyName("email");
            JsonSerializer.Serialize(writer, value.Email, options);
            if (value.Phone != null)
            {
                writer.WritePropertyName("phone");
                JsonSerializer.Serialize(writer, value.Phone, options);
            }
            writer.WritePropertyName("createdAt");
            JsonSerializer.Serialize(writer, value.CreatedAt, options);
            writer.WritePropertyName("updatedAt");
            JsonSerializer.Serialize(writer, value.UpdatedAt, options);
            if (value.Address != null)
            {
                writer.WritePropertyName("address");
                JsonSerializer.Serialize(writer, value.Address, options);
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

        public override UserResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UserResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
