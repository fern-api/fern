using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(Organization.JsonConverter))]
[Serializable]
public record Organization
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [Nullable]
    [JsonPropertyName("domain")]
    public string? Domain { get; set; }

    [Optional]
    [JsonPropertyName("employeeCount")]
    public int? EmployeeCount { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Organization>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Organization).IsAssignableFrom(typeToConvert);

        public override Organization? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _id = default;
            string _name = default;
            string? _domain = default;
            int? _employeeCount = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "domain":
                        _domain = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "employeeCount":
                        _employeeCount = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Organization
            {
                Id = _id,
                Name = _name,
                Domain = _domain,
                EmployeeCount = _employeeCount,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Organization value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("domain");
            JsonSerializer.Serialize(writer, value.Domain, options);
            if (value.EmployeeCount != null)
            {
                writer.WritePropertyName("employeeCount");
                JsonSerializer.Serialize(writer, value.EmployeeCount, options);
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
