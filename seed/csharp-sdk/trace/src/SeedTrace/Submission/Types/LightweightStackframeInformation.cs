using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(LightweightStackframeInformation.JsonConverter))]
[Serializable]
public record LightweightStackframeInformation
{
    [JsonPropertyName("numStackFrames")]
    public required int NumStackFrames { get; set; }

    [JsonPropertyName("topStackFrameMethodName")]
    public required string TopStackFrameMethodName { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<LightweightStackframeInformation>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(LightweightStackframeInformation).IsAssignableFrom(typeToConvert);

        public override LightweightStackframeInformation? Read(
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
            string _topStackFrameMethodName = default;
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
                    case "topStackFrameMethodName":
                        _topStackFrameMethodName = JsonSerializer.Deserialize<string>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new LightweightStackframeInformation
            {
                NumStackFrames = _numStackFrames,
                TopStackFrameMethodName = _topStackFrameMethodName,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            LightweightStackframeInformation value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("numStackFrames");
            JsonSerializer.Serialize(writer, value.NumStackFrames, options);
            writer.WritePropertyName("topStackFrameMethodName");
            JsonSerializer.Serialize(writer, value.TopStackFrameMethodName, options);
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

        public override LightweightStackframeInformation ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<LightweightStackframeInformation>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            LightweightStackframeInformation value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
