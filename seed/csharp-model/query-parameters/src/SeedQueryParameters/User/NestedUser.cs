using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedQueryParameters.Core;

namespace SeedQueryParameters;

[JsonConverter(typeof(NestedUser.JsonConverter))]
[Serializable]
public record NestedUser
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("user")]
    public required User User { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedUser>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NestedUser).IsAssignableFrom(typeToConvert);

        public override NestedUser? Read(
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
            User _user = default;
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
                    case "user":
                        _user = JsonSerializer.Deserialize<User>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NestedUser
            {
                Name = _name,
                User = _user,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedUser value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("user");
            JsonSerializer.Serialize(writer, value.User, options);
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
