using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// For testing PATCH operations
/// </summary>
[JsonConverter(typeof(UpdateUserRequest.JsonConverter))]
[Serializable]
public record UpdateUserRequest
{
    [Optional]
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("email")]
    public Optional<string?> Email { get; set; }

    [Optional]
    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("address")]
    public Optional<Address?> Address { get; set; }

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

            string? _username = default;
            var _email = Optional<string?>.Undefined;
            string? _phone = default;
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
                        _username = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "email":
                        _email = Optional<string?>.Of(
                            JsonSerializer.Deserialize<string?>(ref reader, options)
                        );
                        break;
                    case "phone":
                        _phone = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "address":
                        _address = Optional<Address?>.Of(
                            JsonSerializer.Deserialize<Address?>(ref reader, options)
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UpdateUserRequest
            {
                Username = _username,
                Email = _email,
                Phone = _phone,
                Address = _address,
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
            if (value.Username != null)
            {
                writer.WritePropertyName("username");
                JsonSerializer.Serialize(writer, value.Username, options);
            }
            if (value.Email.IsDefined)
            {
                writer.WritePropertyName("email");
                JsonSerializer.Serialize(writer, value.Email.Value, options);
            }
            if (value.Phone != null)
            {
                writer.WritePropertyName("phone");
                JsonSerializer.Serialize(writer, value.Phone, options);
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
