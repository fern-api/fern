using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

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
            if (value.Users is not null)
            {
                writer.WritePropertyName("users");
                JsonSerializer.Serialize(writer, value.Users, options);
            }
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

        public override UserOptionalListContainer ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UserOptionalListContainer>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserOptionalListContainer value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
