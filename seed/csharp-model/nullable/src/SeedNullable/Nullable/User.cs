using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedNullable.Core;

namespace SeedNullable;

[JsonConverter(typeof(User.JsonConverter))]
[Serializable]
public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("favorite-number")]
    public required OneOf<int, float?, string?, double> FavoriteNumber { get; set; }

    [JsonPropertyName("numbers")]
    public IEnumerable<int>? Numbers { get; set; }

    [JsonPropertyName("strings")]
    public Dictionary<string, object?>? Strings { get; set; }

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

            string _name = default;
            string _id = default;
            IEnumerable<string>? _tags = default;
            Metadata? _metadata = default;
            string? _email = default;
            OneOf<int, float?, string?, double> _favoriteNumber = default;
            IEnumerable<int>? _numbers = default;
            Dictionary<string, object?>? _strings = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "tags":
                        _tags = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Metadata?>(ref reader, options);
                        break;
                    case "email":
                        _email = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "favorite-number":
                        _favoriteNumber = JsonSerializer.Deserialize<
                            OneOf<int, float?, string?, double>
                        >(ref reader, options);
                        break;
                    case "numbers":
                        _numbers = JsonSerializer.Deserialize<IEnumerable<int>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "strings":
                        _strings = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new User
            {
                Name = _name,
                Id = _id,
                Tags = _tags,
                Metadata = _metadata,
                Email = _email,
                FavoriteNumber = _favoriteNumber,
                Numbers = _numbers,
                Strings = _strings,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, User value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            if (value.Tags != null)
            {
                writer.WritePropertyName("tags");
                JsonSerializer.Serialize(writer, value.Tags, options);
            }
            if (value.Metadata != null)
            {
                writer.WritePropertyName("metadata");
                JsonSerializer.Serialize(writer, value.Metadata, options);
            }
            if (value.Email != null)
            {
                writer.WritePropertyName("email");
                JsonSerializer.Serialize(writer, value.Email, options);
            }
            writer.WritePropertyName("favorite-number");
            JsonSerializer.Serialize(writer, value.FavoriteNumber, options);
            if (value.Numbers != null)
            {
                writer.WritePropertyName("numbers");
                JsonSerializer.Serialize(writer, value.Numbers, options);
            }
            if (value.Strings != null)
            {
                writer.WritePropertyName("strings");
                JsonSerializer.Serialize(writer, value.Strings, options);
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

        public override User ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<User>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            User value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
