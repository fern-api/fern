using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedEmptyClients;
using SeedEmptyClients.Core;

namespace SeedEmptyClients.Level1;

[JsonConverter(typeof(Address.JsonConverter))]
[Serializable]
public record Address
{
    [JsonPropertyName("line1")]
    public required string Line1 { get; set; }

    [JsonPropertyName("line2")]
    public string? Line2 { get; set; }

    [JsonPropertyName("city")]
    public required string City { get; set; }

    [JsonPropertyName("state")]
    public required string State { get; set; }

    [JsonPropertyName("zip")]
    public required string Zip { get; set; }

    [JsonPropertyName("country")]
    public string Country { get; set; } = "USA";

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Address>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Address).IsAssignableFrom(typeToConvert);

        public override Address? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _line1 = default;
            string? _line2 = default;
            string _city = default;
            string _state = default;
            string _zip = default;
            string _country = default;
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
                    case "line1":
                        _line1 = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "line2":
                        _line2 = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "city":
                        _city = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "state":
                        _state = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "zip":
                        _zip = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "country":
                        _country = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Address
            {
                Line1 = _line1,
                Line2 = _line2,
                City = _city,
                State = _state,
                Zip = _zip,
                Country = _country,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Address value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("line1");
            JsonSerializer.Serialize(writer, value.Line1, options);
            if (value.Line2 != null)
            {
                writer.WritePropertyName("line2");
                JsonSerializer.Serialize(writer, value.Line2, options);
            }
            writer.WritePropertyName("city");
            JsonSerializer.Serialize(writer, value.City, options);
            writer.WritePropertyName("state");
            JsonSerializer.Serialize(writer, value.State, options);
            writer.WritePropertyName("zip");
            JsonSerializer.Serialize(writer, value.Zip, options);
            writer.WritePropertyName("country");
            JsonSerializer.Serialize(writer, value.Country, options);
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

        public override Address ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Address>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Address value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
