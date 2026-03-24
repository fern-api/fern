using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(TestCaseV2.JsonConverter))]
[Serializable]
public record TestCaseV2
{
    [JsonPropertyName("metadata")]
    public required TestCaseMetadata Metadata { get; set; }

    [JsonPropertyName("implementation")]
    public required TestCaseImplementationReference Implementation { get; set; }

    [JsonPropertyName("arguments")]
    public Dictionary<string, VariableValue> Arguments { get; set; } =
        new Dictionary<string, VariableValue>();

    [JsonPropertyName("expects")]
    public TestCaseExpects? Expects { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestCaseV2).IsAssignableFrom(typeToConvert);

        public override TestCaseV2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            TestCaseMetadata _metadata = default;
            TestCaseImplementationReference _implementation = default;
            Dictionary<string, VariableValue> _arguments = default;
            TestCaseExpects? _expects = default;
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
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<TestCaseMetadata>(
                            ref reader,
                            options
                        );
                        break;
                    case "implementation":
                        _implementation =
                            JsonSerializer.Deserialize<TestCaseImplementationReference>(
                                ref reader,
                                options
                            );
                        break;
                    case "arguments":
                        _arguments = JsonSerializer.Deserialize<Dictionary<string, VariableValue>>(
                            ref reader,
                            options
                        );
                        break;
                    case "expects":
                        _expects = JsonSerializer.Deserialize<TestCaseExpects?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestCaseV2
            {
                Metadata = _metadata,
                Implementation = _implementation,
                Arguments = _arguments,
                Expects = _expects,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("metadata");
            JsonSerializer.Serialize(writer, value.Metadata, options);
            writer.WritePropertyName("implementation");
            JsonSerializer.Serialize(writer, value.Implementation, options);
            writer.WritePropertyName("arguments");
            JsonSerializer.Serialize(writer, value.Arguments, options);
            if (value.Expects != null)
            {
                writer.WritePropertyName("expects");
                JsonSerializer.Serialize(writer, value.Expects, options);
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
