using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination;
using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

[JsonConverter(typeof(UserOptionalListContainer.JsonConverter))]
[Serializable]
public record UserOptionalListContainer
{
    [JsonPropertyName("users")]
    public IEnumerable<User>? Users { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UserOptionalListContainer>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserOptionalListContainer).IsAssignableFrom(typeToConvert);

        public override UserOptionalListContainer? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<User>? _users = default;
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
                    case "users":
                        _users = JsonSerializer.Deserialize<IEnumerable<User>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UserOptionalListContainer
            {
                Users = _users,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserOptionalListContainer value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Users != null)
            {
                writer.WritePropertyName("users");
                JsonSerializer.Serialize(writer, value.Users, options);
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
