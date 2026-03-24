using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(WorkspaceSubmitRequest.JsonConverter))]
[Serializable]
public record WorkspaceSubmitRequest
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("submissionFiles")]
    public IEnumerable<SubmissionFileInfo> SubmissionFiles { get; set; } =
        new List<SubmissionFileInfo>();

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
    internal sealed class JsonConverter : JsonConverter<WorkspaceSubmitRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(WorkspaceSubmitRequest).IsAssignableFrom(typeToConvert);

        public override WorkspaceSubmitRequest? Read(
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
                    case "userId":
                        _userId = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new WorkspaceSubmitRequest
            {
                SubmissionId = _submissionId,
                Language = _language,
                SubmissionFiles = _submissionFiles,
                UserId = _userId,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            WorkspaceSubmitRequest value,
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

        public override WorkspaceSubmitRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<WorkspaceSubmitRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            WorkspaceSubmitRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
