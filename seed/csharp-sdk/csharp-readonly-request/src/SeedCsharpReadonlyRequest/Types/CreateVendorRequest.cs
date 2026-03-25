using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedCsharpReadonlyRequest.Core;

namespace SeedCsharpReadonlyRequest;

/// <summary>
/// Request to create vendors
/// </summary>
[JsonConverter(typeof(CreateVendorRequest.JsonConverter))]
[Serializable]
public record CreateVendorRequest
{
    /// <summary>
    /// Map of vendor ID to vendor data
    /// </summary>
    [JsonPropertyName("vendors")]
    public Dictionary<string, Vendor> Vendors { get; set; } = new Dictionary<string, Vendor>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateVendorRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CreateVendorRequest).IsAssignableFrom(typeToConvert);

        public override CreateVendorRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Dictionary<string, Vendor> _vendors = default;
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
                    case "vendors":
                        _vendors = JsonSerializer.Deserialize<Dictionary<string, Vendor>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CreateVendorRequest
            {
                Vendors = _vendors,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateVendorRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("vendors");
            JsonSerializer.Serialize(writer, value.Vendors, options);
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

        public override CreateVendorRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<CreateVendorRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CreateVendorRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
