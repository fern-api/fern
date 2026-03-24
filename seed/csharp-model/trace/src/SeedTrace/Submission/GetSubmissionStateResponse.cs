using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(GetSubmissionStateResponse.JsonConverter))]
[Serializable]
public record GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; set; }

    [JsonPropertyName("submission")]
    public required string Submission { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("submissionTypeState")]
    public required SubmissionTypeState SubmissionTypeState { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GetSubmissionStateResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GetSubmissionStateResponse).IsAssignableFrom(typeToConvert);

        public override GetSubmissionStateResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            DateTime? _timeSubmitted = default;
            string _submission = default;
            Language _language = default;
            SubmissionTypeState _submissionTypeState = default;
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
                    case "timeSubmitted":
                        _timeSubmitted = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "submission":
                        _submission = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "language":
                        _language = JsonSerializer.Deserialize<Language>(ref reader, options);
                        break;
                    case "submissionTypeState":
                        _submissionTypeState = JsonSerializer.Deserialize<SubmissionTypeState>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GetSubmissionStateResponse
            {
                TimeSubmitted = _timeSubmitted,
                Submission = _submission,
                Language = _language,
                SubmissionTypeState = _submissionTypeState,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetSubmissionStateResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.TimeSubmitted != null)
            {
                writer.WritePropertyName("timeSubmitted");
                JsonSerializer.Serialize(writer, value.TimeSubmitted, options);
            }
            writer.WritePropertyName("submission");
            JsonSerializer.Serialize(writer, value.Submission, options);
            writer.WritePropertyName("language");
            JsonSerializer.Serialize(writer, value.Language, options);
            writer.WritePropertyName("submissionTypeState");
            JsonSerializer.Serialize(writer, value.SubmissionTypeState, options);
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

        public override GetSubmissionStateResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<GetSubmissionStateResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetSubmissionStateResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
