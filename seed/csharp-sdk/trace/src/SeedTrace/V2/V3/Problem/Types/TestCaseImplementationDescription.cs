using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(TestCaseImplementationDescription.JsonConverter))]
[Serializable]
public record TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public IEnumerable<TestCaseImplementationDescriptionBoard> Boards { get; set; } =
        new List<TestCaseImplementationDescriptionBoard>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseImplementationDescription>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestCaseImplementationDescription).IsAssignableFrom(typeToConvert);

        public override TestCaseImplementationDescription? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<TestCaseImplementationDescriptionBoard> _boards = default;
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
                    case "boards":
                        _boards = JsonSerializer.Deserialize<
                            IEnumerable<TestCaseImplementationDescriptionBoard>
                        >(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestCaseImplementationDescription
            {
                Boards = _boards,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseImplementationDescription value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("boards");
            JsonSerializer.Serialize(writer, value.Boards, options);
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
