using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestSubmissionUpdate.JsonConverter))]
[Serializable]
public record TestSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public required DateTime UpdateTime { get; set; }

    [JsonPropertyName("updateInfo")]
    public required TestSubmissionUpdateInfo UpdateInfo { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestSubmissionUpdate>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestSubmissionUpdate).IsAssignableFrom(typeToConvert);

        public override TestSubmissionUpdate? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            DateTime _updateTime = default;
            TestSubmissionUpdateInfo _updateInfo = default;
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
                    case "updateTime":
                        _updateTime = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "updateInfo":
                        _updateInfo = JsonSerializer.Deserialize<TestSubmissionUpdateInfo>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestSubmissionUpdate
            {
                UpdateTime = _updateTime,
                UpdateInfo = _updateInfo,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestSubmissionUpdate value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("updateTime");
            JsonSerializer.Serialize(writer, value.UpdateTime, options);
            writer.WritePropertyName("updateInfo");
            JsonSerializer.Serialize(writer, value.UpdateInfo, options);
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

        public override TestSubmissionUpdate ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestSubmissionUpdate>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestSubmissionUpdate value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
