using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(SubmitRequestV2.JsonConverter))]
[Serializable]
public record SubmitRequestV2
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("submissionFiles")]
    public IEnumerable<SubmissionFileInfo> SubmissionFiles { get; set; } =
        new List<SubmissionFileInfo>();

    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; set; }

    [JsonPropertyName("userId")]
    public string? UserId { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmitRequestV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SubmitRequestV2).IsAssignableFrom(typeToConvert);

        public override SubmitRequestV2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _submissionId = default;
            Language _language = default;
            IEnumerable<SubmissionFileInfo> _submissionFiles = default;
            string _problemId = default;
            int? _problemVersion = default;
            string? _userId = default;
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
                    case "submissionId":
                        _submissionId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "language":
                        _language = JsonSerializer.Deserialize<Language>(ref reader, options);
                        break;
                    case "submissionFiles":
                        _submissionFiles = JsonSerializer.Deserialize<
                            IEnumerable<SubmissionFileInfo>
                        >(ref reader, options);
                        break;
                    case "problemId":
                        _problemId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "problemVersion":
                        _problemVersion = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "userId":
                        _userId = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SubmitRequestV2
            {
                SubmissionId = _submissionId,
                Language = _language,
                SubmissionFiles = _submissionFiles,
                ProblemId = _problemId,
                ProblemVersion = _problemVersion,
                UserId = _userId,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmitRequestV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("submissionId");
            JsonSerializer.Serialize(writer, value.SubmissionId, options);
            writer.WritePropertyName("language");
            JsonSerializer.Serialize(writer, value.Language, options);
            writer.WritePropertyName("submissionFiles");
            JsonSerializer.Serialize(writer, value.SubmissionFiles, options);
            writer.WritePropertyName("problemId");
            JsonSerializer.Serialize(writer, value.ProblemId, options);
            if (value.ProblemVersion != null)
            {
                writer.WritePropertyName("problemVersion");
                JsonSerializer.Serialize(writer, value.ProblemVersion, options);
            }
            if (value.UserId != null)
            {
                writer.WritePropertyName("userId");
                JsonSerializer.Serialize(writer, value.UserId, options);
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
