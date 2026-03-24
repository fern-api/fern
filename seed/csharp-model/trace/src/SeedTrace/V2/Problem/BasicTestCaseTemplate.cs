using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(BasicTestCaseTemplate.JsonConverter))]
[Serializable]
public record BasicTestCaseTemplate
{
    [JsonPropertyName("templateId")]
    public required string TemplateId { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("description")]
    public required TestCaseImplementationDescription Description { get; set; }

    [JsonPropertyName("expectedValueParameterId")]
    public required string ExpectedValueParameterId { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BasicTestCaseTemplate>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BasicTestCaseTemplate).IsAssignableFrom(typeToConvert);

        public override BasicTestCaseTemplate? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _templateId = default;
            string _name = default;
            TestCaseImplementationDescription _description = default;
            string _expectedValueParameterId = default;
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
                    case "templateId":
                        _templateId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "description":
                        _description =
                            JsonSerializer.Deserialize<TestCaseImplementationDescription>(
                                ref reader,
                                options
                            );
                        break;
                    case "expectedValueParameterId":
                        _expectedValueParameterId = JsonSerializer.Deserialize<string>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new BasicTestCaseTemplate
            {
                TemplateId = _templateId,
                Name = _name,
                Description = _description,
                ExpectedValueParameterId = _expectedValueParameterId,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            BasicTestCaseTemplate value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("templateId");
            JsonSerializer.Serialize(writer, value.TemplateId, options);
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("description");
            JsonSerializer.Serialize(writer, value.Description, options);
            writer.WritePropertyName("expectedValueParameterId");
            JsonSerializer.Serialize(writer, value.ExpectedValueParameterId, options);
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

        public override BasicTestCaseTemplate ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<BasicTestCaseTemplate>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BasicTestCaseTemplate value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
