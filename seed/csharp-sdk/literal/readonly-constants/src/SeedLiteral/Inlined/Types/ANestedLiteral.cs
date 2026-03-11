using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(ANestedLiteral.JsonConverter))]
[Serializable]
public record ANestedLiteral : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("myLiteral")]
    public string MyLiteral => "How super cool";

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal sealed class JsonConverter : JsonConverter<ANestedLiteral>
    {
        public override ANestedLiteral? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var document = JsonDocument.ParseValue(ref reader);
            if (
                document.RootElement.TryGetProperty("myLiteral", out var myLiteralElement)
                && myLiteralElement.GetString() != "How super cool"
            )
            {
                throw new JsonException(
                    $"Expected literal 'myLiteral' to be 'How super cool', got '{myLiteralElement.GetString()}'"
                );
            }
            return document.Deserialize<ANestedLiteral>(JsonOptions.JsonSerializerOptions);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ANestedLiteral value,
            JsonSerializerOptions options
        )
        {
            JsonSerializer.Serialize(writer, value, JsonOptions.JsonSerializerOptions);
        }
    }
}
