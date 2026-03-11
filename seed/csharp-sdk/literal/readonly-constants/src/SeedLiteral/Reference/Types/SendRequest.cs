using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(SendRequest.JsonConverter))]
[Serializable]
public record SendRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("prompt")]
    public string Prompt => "You are a helpful assistant";

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream => false;

    [JsonPropertyName("ending")]
    public string Ending => "$ending";

    [JsonPropertyName("context")]
    public string Context => "You're super wise";

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("containerObject")]
    public required ContainerObject ContainerObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal sealed class JsonConverter : JsonConverter<SendRequest>
    {
        public override SendRequest? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var document = JsonDocument.ParseValue(ref reader);
            if (
                document.RootElement.TryGetProperty("prompt", out var promptElement)
                && promptElement.GetString() != "You are a helpful assistant"
            )
            {
                throw new JsonException(
                    $"Expected literal 'prompt' to be 'You are a helpful assistant', got '{promptElement.GetString()}'"
                );
            }
            if (
                document.RootElement.TryGetProperty("ending", out var endingElement)
                && endingElement.GetString() != "$ending"
            )
            {
                throw new JsonException(
                    $"Expected literal 'ending' to be '$ending', got '{endingElement.GetString()}'"
                );
            }
            if (
                document.RootElement.TryGetProperty("context", out var contextElement)
                && contextElement.GetString() != "You're super wise"
            )
            {
                throw new JsonException(
                    $"Expected literal 'context' to be 'You're super wise', got '{contextElement.GetString()}'"
                );
            }
            return document.Deserialize<SendRequest>(JsonOptions.JsonSerializerOptions);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendRequest value,
            JsonSerializerOptions options
        )
        {
            JsonSerializer.Serialize(writer, value, JsonOptions.JsonSerializerOptions);
        }
    }
}
