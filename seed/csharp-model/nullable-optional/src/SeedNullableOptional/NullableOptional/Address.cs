using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Nested object for testing
/// </summary>
[JsonConverter(typeof(Address.JsonConverter))]
[Serializable]
public record Address
{
    [JsonPropertyName("street")]
    public required string Street { get; set; }

    [JsonPropertyName("city")]
    public string? City { get; set; }

    [JsonPropertyName("state")]
    public string? State { get; set; }

    [JsonPropertyName("zipCode")]
    public required string ZipCode { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    [JsonPropertyName("buildingId")]
    public string? BuildingId { get; set; }

    [JsonPropertyName("tenantId")]
    public string? TenantId { get; set; }

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

            string _street = default;
            string? _city = default;
            string? _state = default;
            string _zipCode = default;
            string? _country = default;
            string? _buildingId = default;
            string? _tenantId = default;
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
                    case "street":
                        _street = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "city":
                        _city = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "state":
                        _state = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "zipCode":
                        _zipCode = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "country":
                        _country = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "buildingId":
                        _buildingId = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "tenantId":
                        _tenantId = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Address
            {
                Street = _street,
                City = _city,
                State = _state,
                ZipCode = _zipCode,
                Country = _country,
                BuildingId = _buildingId,
                TenantId = _tenantId,
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
            writer.WritePropertyName("street");
            JsonSerializer.Serialize(writer, value.Street, options);
            if (value.City is not null)
            {
                writer.WritePropertyName("city");
                JsonSerializer.Serialize(writer, value.City, options);
            }
            if (value.State is not null)
            {
                writer.WritePropertyName("state");
                JsonSerializer.Serialize(writer, value.State, options);
            }
            writer.WritePropertyName("zipCode");
            JsonSerializer.Serialize(writer, value.ZipCode, options);
            if (value.Country is not null)
            {
                writer.WritePropertyName("country");
                JsonSerializer.Serialize(writer, value.Country, options);
            }
            if (value.BuildingId is not null)
            {
                writer.WritePropertyName("buildingId");
                JsonSerializer.Serialize(writer, value.BuildingId, options);
            }
            if (value.TenantId is not null)
            {
                writer.WritePropertyName("tenantId");
                JsonSerializer.Serialize(writer, value.TenantId, options);
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
