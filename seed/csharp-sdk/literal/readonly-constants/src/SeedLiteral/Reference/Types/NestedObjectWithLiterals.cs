using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(NestedObjectWithLiterals.JsonConverter))]
[Serializable]
public record NestedObjectWithLiterals : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("literal1")]
    public string Literal1 => "literal1";

    [JsonPropertyName("literal2")]
    public string Literal2 => "literal2";

    [JsonPropertyName("strProp")]
    public required string StrProp { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal sealed class JsonConverter : JsonConverter<NestedObjectWithLiterals>
    {
        public override NestedObjectWithLiterals? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var document = JsonDocument.ParseValue(ref reader);
            if (
                document.RootElement.TryGetProperty("literal1", out var literal1Element)
                && literal1Element.GetString() != "literal1"
            )
            {
                throw new JsonException(
                    $"Expected literal 'literal1' to be 'literal1', got '{literal1Element.GetString()}'"
                );
            }
            if (
                document.RootElement.TryGetProperty("literal2", out var literal2Element)
                && literal2Element.GetString() != "literal2"
            )
            {
                throw new JsonException(
                    $"Expected literal 'literal2' to be 'literal2', got '{literal2Element.GetString()}'"
                );
            }
            return document.Deserialize<NestedObjectWithLiterals>(
                JsonOptions.JsonSerializerOptions
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithLiterals value,
            JsonSerializerOptions options
        )
        {
            JsonSerializer.Serialize(writer, value, JsonOptions.JsonSerializerOptions);
        }
    }
}
