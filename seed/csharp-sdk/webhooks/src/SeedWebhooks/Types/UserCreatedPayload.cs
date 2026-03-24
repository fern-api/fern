using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebhooks.Core;

namespace SeedWebhooks;

[JsonConverter(typeof(UserCreatedPayload.JsonConverter))]
[Serializable]
public record UserCreatedPayload
{
    [JsonPropertyName("userId")]
    public required string UserId { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("createdAt")]
    public required string CreatedAt { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UserCreatedPayload>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserCreatedPayload).IsAssignableFrom(typeToConvert);

        public override UserCreatedPayload? Read(
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
            string _createdAt = default;
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
                    case "userId":
                        _userId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "email":
                        _email = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "createdAt":
                        _createdAt = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UserCreatedPayload
            {
                UserId = _userId,
                Email = _email,
                CreatedAt = _createdAt,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserCreatedPayload value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("userId");
            JsonSerializer.Serialize(writer, value.UserId, options);
            writer.WritePropertyName("email");
            JsonSerializer.Serialize(writer, value.Email, options);
            writer.WritePropertyName("createdAt");
            JsonSerializer.Serialize(writer, value.CreatedAt, options);
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

        public override UserCreatedPayload ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UserCreatedPayload>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserCreatedPayload value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
