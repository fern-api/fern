using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(WorkspaceSubmissionUpdate.JsonConverter))]
[Serializable]
public record WorkspaceSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public required DateTime UpdateTime { get; set; }

    [JsonPropertyName("updateInfo")]
    public required WorkspaceSubmissionUpdateInfo UpdateInfo { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<WorkspaceSubmissionUpdate>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(WorkspaceSubmissionUpdate).IsAssignableFrom(typeToConvert);

        public override WorkspaceSubmissionUpdate? Read(
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
            WorkspaceSubmissionUpdateInfo _updateInfo = default;
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
                        _updateInfo = JsonSerializer.Deserialize<WorkspaceSubmissionUpdateInfo>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new WorkspaceSubmissionUpdate
            {
                UpdateTime = _updateTime,
                UpdateInfo = _updateInfo,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            WorkspaceSubmissionUpdate value,
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
    }
}
