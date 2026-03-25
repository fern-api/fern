using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(BasicCustomFiles.JsonConverter))]
[Serializable]
public record BasicCustomFiles
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("signature")]
    public required NonVoidFunctionSignature Signature { get; set; }

    [JsonPropertyName("additionalFiles")]
    public Dictionary<Language, Files> AdditionalFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("basicTestCaseTemplate")]
    public required BasicTestCaseTemplate BasicTestCaseTemplate { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BasicCustomFiles>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BasicCustomFiles).IsAssignableFrom(typeToConvert);

        public override BasicCustomFiles? Read(
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
            NonVoidFunctionSignature _signature = default;
            Dictionary<Language, Files> _additionalFiles = default;
            BasicTestCaseTemplate _basicTestCaseTemplate = default;
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
                    case "signature":
                        _signature = JsonSerializer.Deserialize<NonVoidFunctionSignature>(
                            ref reader,
                            options
                        );
                        break;
                    case "additionalFiles":
                        _additionalFiles = JsonSerializer.Deserialize<Dictionary<Language, Files>>(
                            ref reader,
                            options
                        );
                        break;
                    case "basicTestCaseTemplate":
                        _basicTestCaseTemplate = JsonSerializer.Deserialize<BasicTestCaseTemplate>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new BasicCustomFiles
            {
                MethodName = _methodName,
                Signature = _signature,
                AdditionalFiles = _additionalFiles,
                BasicTestCaseTemplate = _basicTestCaseTemplate,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            BasicCustomFiles value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("methodName");
            JsonSerializer.Serialize(writer, value.MethodName, options);
            writer.WritePropertyName("signature");
            JsonSerializer.Serialize(writer, value.Signature, options);
            writer.WritePropertyName("additionalFiles");
            JsonSerializer.Serialize(writer, value.AdditionalFiles, options);
            writer.WritePropertyName("basicTestCaseTemplate");
            JsonSerializer.Serialize(writer, value.BasicTestCaseTemplate, options);
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

        public override BasicCustomFiles ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<BasicCustomFiles>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BasicCustomFiles value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
