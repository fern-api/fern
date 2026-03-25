using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ExecutionSessionState.JsonConverter))]
[Serializable]
public record ExecutionSessionState
{
    [JsonPropertyName("lastTimeContacted")]
    public string? LastTimeContacted { get; set; }

    /// <summary>
    /// The auto-generated session id. Formatted as a uuid.
    /// </summary>
    [JsonPropertyName("sessionId")]
    public required string SessionId { get; set; }

    [JsonPropertyName("isWarmInstance")]
    public required bool IsWarmInstance { get; set; }

    [JsonPropertyName("awsTaskId")]
    public string? AwsTaskId { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("status")]
    public required ExecutionSessionStatus Status { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ExecutionSessionState>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ExecutionSessionState).IsAssignableFrom(typeToConvert);

        public override ExecutionSessionState? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _lastTimeContacted = default;
            string _sessionId = default;
            bool _isWarmInstance = default;
            string? _awsTaskId = default;
            Language _language = default;
            ExecutionSessionStatus _status = default;
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
                    case "lastTimeContacted":
                        _lastTimeContacted = JsonSerializer.Deserialize<string?>(
                            ref reader,
                            options
                        );
                        break;
                    case "sessionId":
                        _sessionId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "isWarmInstance":
                        _isWarmInstance = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    case "awsTaskId":
                        _awsTaskId = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "language":
                        _language = JsonSerializer.Deserialize<Language>(ref reader, options);
                        break;
                    case "status":
                        _status = JsonSerializer.Deserialize<ExecutionSessionStatus>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ExecutionSessionState
            {
                LastTimeContacted = _lastTimeContacted,
                SessionId = _sessionId,
                IsWarmInstance = _isWarmInstance,
                AwsTaskId = _awsTaskId,
                Language = _language,
                Status = _status,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ExecutionSessionState value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.LastTimeContacted is not null)
            {
                writer.WritePropertyName("lastTimeContacted");
                JsonSerializer.Serialize(writer, value.LastTimeContacted, options);
            }
            writer.WritePropertyName("sessionId");
            JsonSerializer.Serialize(writer, value.SessionId, options);
            writer.WritePropertyName("isWarmInstance");
            JsonSerializer.Serialize(writer, value.IsWarmInstance, options);
            if (value.AwsTaskId is not null)
            {
                writer.WritePropertyName("awsTaskId");
                JsonSerializer.Serialize(writer, value.AwsTaskId, options);
            }
            writer.WritePropertyName("language");
            JsonSerializer.Serialize(writer, value.Language, options);
            writer.WritePropertyName("status");
            JsonSerializer.Serialize(writer, value.Status, options);
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

        public override ExecutionSessionState ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ExecutionSessionState>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ExecutionSessionState value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
