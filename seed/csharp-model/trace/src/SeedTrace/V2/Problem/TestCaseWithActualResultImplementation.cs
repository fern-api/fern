using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(TestCaseWithActualResultImplementation.JsonConverter))]
[Serializable]
public record TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public required NonVoidFunctionDefinition GetActualResult { get; set; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public required AssertCorrectnessCheck AssertCorrectnessCheck { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseWithActualResultImplementation>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestCaseWithActualResultImplementation).IsAssignableFrom(typeToConvert);

        public override TestCaseWithActualResultImplementation? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            NonVoidFunctionDefinition _getActualResult = default;
            AssertCorrectnessCheck _assertCorrectnessCheck = default;
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
                    case "getActualResult":
                        _getActualResult = JsonSerializer.Deserialize<NonVoidFunctionDefinition>(
                            ref reader,
                            options
                        );
                        break;
                    case "assertCorrectnessCheck":
                        _assertCorrectnessCheck =
                            JsonSerializer.Deserialize<AssertCorrectnessCheck>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestCaseWithActualResultImplementation
            {
                GetActualResult = _getActualResult,
                AssertCorrectnessCheck = _assertCorrectnessCheck,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseWithActualResultImplementation value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("getActualResult");
            JsonSerializer.Serialize(writer, value.GetActualResult, options);
            writer.WritePropertyName("assertCorrectnessCheck");
            JsonSerializer.Serialize(writer, value.AssertCorrectnessCheck, options);
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
