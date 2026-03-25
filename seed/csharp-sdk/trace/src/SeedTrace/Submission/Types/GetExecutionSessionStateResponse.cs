using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(GetExecutionSessionStateResponse.JsonConverter))]
[Serializable]
public record GetExecutionSessionStateResponse
{
    [JsonPropertyName("states")]
    public Dictionary<string, ExecutionSessionState> States { get; set; } =
        new Dictionary<string, ExecutionSessionState>();

    [JsonPropertyName("numWarmingInstances")]
    public int? NumWarmingInstances { get; set; }

    [JsonPropertyName("warmingSessionIds")]
    public IEnumerable<string> WarmingSessionIds { get; set; } = new List<string>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GetExecutionSessionStateResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GetExecutionSessionStateResponse).IsAssignableFrom(typeToConvert);

        public override GetExecutionSessionStateResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Dictionary<string, ExecutionSessionState> _states = default;
            int? _numWarmingInstances = default;
            IEnumerable<string> _warmingSessionIds = default;
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
                    case "states":
                        _states = JsonSerializer.Deserialize<
                            Dictionary<string, ExecutionSessionState>
                        >(ref reader, options);
                        break;
                    case "numWarmingInstances":
                        _numWarmingInstances = JsonSerializer.Deserialize<int?>(
                            ref reader,
                            options
                        );
                        break;
                    case "warmingSessionIds":
                        _warmingSessionIds = JsonSerializer.Deserialize<IEnumerable<string>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GetExecutionSessionStateResponse
            {
                States = _states,
                NumWarmingInstances = _numWarmingInstances,
                WarmingSessionIds = _warmingSessionIds,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetExecutionSessionStateResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("states");
            JsonSerializer.Serialize(writer, value.States, options);
            if (value.NumWarmingInstances is not null)
            {
                writer.WritePropertyName("numWarmingInstances");
                JsonSerializer.Serialize(writer, value.NumWarmingInstances, options);
            }
            writer.WritePropertyName("warmingSessionIds");
            JsonSerializer.Serialize(writer, value.WarmingSessionIds, options);
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

        public override GetExecutionSessionStateResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<GetExecutionSessionStateResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetExecutionSessionStateResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
