using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

[JsonConverter(typeof(NestedUser.JsonConverter))]
[Serializable]
public record NestedUser
{
    [JsonPropertyName("Name")]
    public required string Name { get; set; }

    [JsonPropertyName("NestedUser")]
    public required User NestedUser_ { get; set; }

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
            User _nestedUser_ = default;
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
                    case "Name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "NestedUser":
                        _nestedUser_ = JsonSerializer.Deserialize<User>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NestedUser
            {
                Name = _name,
                NestedUser_ = _nestedUser_,
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
            writer.WritePropertyName("Name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("NestedUser");
            JsonSerializer.Serialize(writer, value.NestedUser_, options);
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

        public override NestedUser ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<NestedUser>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedUser value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
