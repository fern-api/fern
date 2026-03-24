using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(StackInformation.JsonConverter))]
[Serializable]
public record StackInformation
{
    [JsonPropertyName("numStackFrames")]
    public required int NumStackFrames { get; set; }

    [JsonPropertyName("topStackFrame")]
    public StackFrame? TopStackFrame { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StackInformation>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StackInformation).IsAssignableFrom(typeToConvert);

        public override StackInformation? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int _numStackFrames = default;
            StackFrame? _topStackFrame = default;
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
                    case "numStackFrames":
                        _numStackFrames = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "topStackFrame":
                        _topStackFrame = JsonSerializer.Deserialize<StackFrame?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new StackInformation
            {
                NumStackFrames = _numStackFrames,
                TopStackFrame = _topStackFrame,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            StackInformation value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("numStackFrames");
            JsonSerializer.Serialize(writer, value.NumStackFrames, options);
            if (value.TopStackFrame != null)
            {
                writer.WritePropertyName("topStackFrame");
                JsonSerializer.Serialize(writer, value.TopStackFrame, options);
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

        public override StackInformation ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<StackInformation>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StackInformation value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
