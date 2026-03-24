using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TraceResponse.JsonConverter))]
[Serializable]
public record TraceResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("returnValue")]
    public DebugVariableValue? ReturnValue { get; set; }

    [JsonPropertyName("expressionLocation")]
    public ExpressionLocation? ExpressionLocation { get; set; }

    [JsonPropertyName("stack")]
    public required StackInformation Stack { get; set; }

    [JsonPropertyName("stdout")]
    public string? Stdout { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TraceResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TraceResponse).IsAssignableFrom(typeToConvert);

        public override TraceResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _submissionId = default;
            int _lineNumber = default;
            DebugVariableValue? _returnValue = default;
            ExpressionLocation? _expressionLocation = default;
            StackInformation _stack = default;
            string? _stdout = default;
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
                    case "submissionId":
                        _submissionId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "lineNumber":
                        _lineNumber = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "returnValue":
                        _returnValue = JsonSerializer.Deserialize<DebugVariableValue?>(
                            ref reader,
                            options
                        );
                        break;
                    case "expressionLocation":
                        _expressionLocation = JsonSerializer.Deserialize<ExpressionLocation?>(
                            ref reader,
                            options
                        );
                        break;
                    case "stack":
                        _stack = JsonSerializer.Deserialize<StackInformation>(ref reader, options);
                        break;
                    case "stdout":
                        _stdout = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TraceResponse
            {
                SubmissionId = _submissionId,
                LineNumber = _lineNumber,
                ReturnValue = _returnValue,
                ExpressionLocation = _expressionLocation,
                Stack = _stack,
                Stdout = _stdout,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TraceResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("submissionId");
            JsonSerializer.Serialize(writer, value.SubmissionId, options);
            writer.WritePropertyName("lineNumber");
            JsonSerializer.Serialize(writer, value.LineNumber, options);
            if (value.ReturnValue != null)
            {
                writer.WritePropertyName("returnValue");
                JsonSerializer.Serialize(writer, value.ReturnValue, options);
            }
            if (value.ExpressionLocation != null)
            {
                writer.WritePropertyName("expressionLocation");
                JsonSerializer.Serialize(writer, value.ExpressionLocation, options);
            }
            writer.WritePropertyName("stack");
            JsonSerializer.Serialize(writer, value.Stack, options);
            if (value.Stdout != null)
            {
                writer.WritePropertyName("stdout");
                JsonSerializer.Serialize(writer, value.Stdout, options);
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
    }
}
