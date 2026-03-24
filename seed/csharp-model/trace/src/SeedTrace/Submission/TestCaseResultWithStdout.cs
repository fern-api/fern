using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestCaseResultWithStdout.JsonConverter))]
[Serializable]
public record TestCaseResultWithStdout
{
    [JsonPropertyName("result")]
    public required TestCaseResult Result { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseResultWithStdout>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestCaseResultWithStdout).IsAssignableFrom(typeToConvert);

        public override TestCaseResultWithStdout? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            TestCaseResult _result = default;
            string _stdout = default;
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
                    case "result":
                        _result = JsonSerializer.Deserialize<TestCaseResult>(ref reader, options);
                        break;
                    case "stdout":
                        _stdout = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestCaseResultWithStdout
            {
                Result = _result,
                Stdout = _stdout,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseResultWithStdout value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("result");
            JsonSerializer.Serialize(writer, value.Result, options);
            writer.WritePropertyName("stdout");
            JsonSerializer.Serialize(writer, value.Stdout, options);
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

        public override TestCaseResultWithStdout ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestCaseResultWithStdout>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestCaseResultWithStdout value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
