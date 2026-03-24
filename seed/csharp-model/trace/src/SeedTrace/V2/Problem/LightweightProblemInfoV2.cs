using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(LightweightProblemInfoV2.JsonConverter))]
[Serializable]
public record LightweightProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("variableTypes")]
    public HashSet<VariableType> VariableTypes { get; set; } = new HashSet<VariableType>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<LightweightProblemInfoV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(LightweightProblemInfoV2).IsAssignableFrom(typeToConvert);

        public override LightweightProblemInfoV2? Read(
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
            string _problemName = default;
            int _problemVersion = default;
            HashSet<VariableType> _variableTypes = default;
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
                    case "problemName":
                        _problemName = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "problemVersion":
                        _problemVersion = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "variableTypes":
                        _variableTypes = JsonSerializer.Deserialize<HashSet<VariableType>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new LightweightProblemInfoV2
            {
                ProblemId = _problemId,
                ProblemName = _problemName,
                ProblemVersion = _problemVersion,
                VariableTypes = _variableTypes,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            LightweightProblemInfoV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("problemId");
            JsonSerializer.Serialize(writer, value.ProblemId, options);
            writer.WritePropertyName("problemName");
            JsonSerializer.Serialize(writer, value.ProblemName, options);
            writer.WritePropertyName("problemVersion");
            JsonSerializer.Serialize(writer, value.ProblemVersion, options);
            writer.WritePropertyName("variableTypes");
            JsonSerializer.Serialize(writer, value.VariableTypes, options);
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
