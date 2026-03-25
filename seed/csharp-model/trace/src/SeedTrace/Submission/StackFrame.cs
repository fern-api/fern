using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(StackFrame.JsonConverter))]
[Serializable]
public record StackFrame
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("scopes")]
    public IEnumerable<Scope> Scopes { get; set; } = new List<Scope>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StackFrame>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StackFrame).IsAssignableFrom(typeToConvert);

        public override StackFrame? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _methodName = default;
            int _lineNumber = default;
            IEnumerable<Scope> _scopes = default;
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
                    case "methodName":
                        _methodName = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "lineNumber":
                        _lineNumber = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "scopes":
                        _scopes = JsonSerializer.Deserialize<IEnumerable<Scope>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new StackFrame
            {
                MethodName = _methodName,
                LineNumber = _lineNumber,
                Scopes = _scopes,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            StackFrame value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("methodName");
            JsonSerializer.Serialize(writer, value.MethodName, options);
            writer.WritePropertyName("lineNumber");
            JsonSerializer.Serialize(writer, value.LineNumber, options);
            writer.WritePropertyName("scopes");
            JsonSerializer.Serialize(writer, value.Scopes, options);
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

        public override StackFrame ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<StackFrame>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StackFrame value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
