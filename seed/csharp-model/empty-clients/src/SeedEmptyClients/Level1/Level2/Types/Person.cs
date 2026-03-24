using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedEmptyClients;
using SeedEmptyClients.Core;

namespace SeedEmptyClients.Level1.Level2;

[JsonConverter(typeof(Person.JsonConverter))]
[Serializable]
public record Person
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("address")]
    public required Address Address { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Person>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Person).IsAssignableFrom(typeToConvert);

        public override Person? Read(
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
            Address _address = default;
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
                    case "address":
                        _address = JsonSerializer.Deserialize<Address>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Person
            {
                Name = _name,
                Address = _address,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Person value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("address");
            JsonSerializer.Serialize(writer, value.Address, options);
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
