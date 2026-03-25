using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestSubmissionStatusV2.JsonConverter))]
[Serializable]
public record TestSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public IEnumerable<TestSubmissionUpdate> Updates { get; set; } =
        new List<TestSubmissionUpdate>();

    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("problemInfo")]
    public required SeedTrace.V2.ProblemInfoV2 ProblemInfo { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestSubmissionStatusV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestSubmissionStatusV2).IsAssignableFrom(typeToConvert);

        public override TestSubmissionStatusV2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<TestSubmissionUpdate> _updates = default;
            string _problemId = default;
            int _problemVersion = default;
            SeedTrace.V2.ProblemInfoV2 _problemInfo = default;
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
                    case "updates":
                        _updates = JsonSerializer.Deserialize<IEnumerable<TestSubmissionUpdate>>(
                            ref reader,
                            options
                        );
                        break;
                    case "problemId":
                        _problemId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "problemVersion":
                        _problemVersion = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "problemInfo":
                        _problemInfo = JsonSerializer.Deserialize<SeedTrace.V2.ProblemInfoV2>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestSubmissionStatusV2
            {
                Updates = _updates,
                ProblemId = _problemId,
                ProblemVersion = _problemVersion,
                ProblemInfo = _problemInfo,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestSubmissionStatusV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("updates");
            JsonSerializer.Serialize(writer, value.Updates, options);
            writer.WritePropertyName("problemId");
            JsonSerializer.Serialize(writer, value.ProblemId, options);
            writer.WritePropertyName("problemVersion");
            JsonSerializer.Serialize(writer, value.ProblemVersion, options);
            writer.WritePropertyName("problemInfo");
            JsonSerializer.Serialize(writer, value.ProblemInfo, options);
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

        public override TestSubmissionStatusV2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestSubmissionStatusV2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestSubmissionStatusV2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
