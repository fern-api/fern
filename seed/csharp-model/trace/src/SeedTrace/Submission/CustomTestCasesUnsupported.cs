using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(CustomTestCasesUnsupported.JsonConverter))]
[Serializable]
public record CustomTestCasesUnsupported
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CustomTestCasesUnsupported>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CustomTestCasesUnsupported).IsAssignableFrom(typeToConvert);

        public override CustomTestCasesUnsupported? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _problemId = default;
            string _submissionId = default;
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
                    case "problemId":
                        _problemId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "submissionId":
                        _submissionId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CustomTestCasesUnsupported
            {
                ProblemId = _problemId,
                SubmissionId = _submissionId,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CustomTestCasesUnsupported value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("problemId");
            JsonSerializer.Serialize(writer, value.ProblemId, options);
            writer.WritePropertyName("submissionId");
            JsonSerializer.Serialize(writer, value.SubmissionId, options);
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
