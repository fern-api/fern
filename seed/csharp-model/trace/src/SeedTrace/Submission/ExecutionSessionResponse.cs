using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ExecutionSessionResponse.JsonConverter))]
[Serializable]
public record ExecutionSessionResponse
{
    [JsonPropertyName("sessionId")]
    public required string SessionId { get; set; }

    [JsonPropertyName("executionSessionUrl")]
    public string? ExecutionSessionUrl { get; set; }

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
    internal sealed class JsonConverter : JsonConverter<ExecutionSessionResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ExecutionSessionResponse).IsAssignableFrom(typeToConvert);

        public override ExecutionSessionResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _sessionId = default;
            string? _executionSessionUrl = default;
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
                    case "sessionId":
                        _sessionId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "executionSessionUrl":
                        _executionSessionUrl = JsonSerializer.Deserialize<string?>(
                            ref reader,
                            options
                        );
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

            return new ExecutionSessionResponse
            {
                SessionId = _sessionId,
                ExecutionSessionUrl = _executionSessionUrl,
                Language = _language,
                Status = _status,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ExecutionSessionResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("sessionId");
            JsonSerializer.Serialize(writer, value.SessionId, options);
            if (value.ExecutionSessionUrl is not null)
            {
                writer.WritePropertyName("executionSessionUrl");
                JsonSerializer.Serialize(writer, value.ExecutionSessionUrl, options);
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

        public override ExecutionSessionResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ExecutionSessionResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ExecutionSessionResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
