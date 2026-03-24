using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(GeneratedFiles.JsonConverter))]
[Serializable]
public record GeneratedFiles
{
    [JsonPropertyName("generatedTestCaseFiles")]
    public Dictionary<Language, Files> GeneratedTestCaseFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("generatedTemplateFiles")]
    public Dictionary<Language, Files> GeneratedTemplateFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("other")]
    public Dictionary<Language, Files> Other { get; set; } = new Dictionary<Language, Files>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GeneratedFiles>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GeneratedFiles).IsAssignableFrom(typeToConvert);

        public override GeneratedFiles? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Dictionary<Language, Files> _generatedTestCaseFiles = default;
            Dictionary<Language, Files> _generatedTemplateFiles = default;
            Dictionary<Language, Files> _other = default;
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
                    case "generatedTestCaseFiles":
                        _generatedTestCaseFiles = JsonSerializer.Deserialize<
                            Dictionary<Language, Files>
                        >(ref reader, options);
                        break;
                    case "generatedTemplateFiles":
                        _generatedTemplateFiles = JsonSerializer.Deserialize<
                            Dictionary<Language, Files>
                        >(ref reader, options);
                        break;
                    case "other":
                        _other = JsonSerializer.Deserialize<Dictionary<Language, Files>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GeneratedFiles
            {
                GeneratedTestCaseFiles = _generatedTestCaseFiles,
                GeneratedTemplateFiles = _generatedTemplateFiles,
                Other = _other,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GeneratedFiles value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("generatedTestCaseFiles");
            JsonSerializer.Serialize(writer, value.GeneratedTestCaseFiles, options);
            writer.WritePropertyName("generatedTemplateFiles");
            JsonSerializer.Serialize(writer, value.GeneratedTemplateFiles, options);
            writer.WritePropertyName("other");
            JsonSerializer.Serialize(writer, value.Other, options);
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
