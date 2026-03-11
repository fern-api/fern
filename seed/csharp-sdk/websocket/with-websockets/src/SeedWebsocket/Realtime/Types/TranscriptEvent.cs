using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

[JsonConverter(typeof(TranscriptEvent.JsonConverter))]
[Serializable]
public record TranscriptEvent : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("type")]
    public string Type => "transcript";

    [JsonPropertyName("data")]
    public required string Data { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal sealed class JsonConverter : JsonConverter<TranscriptEvent>
    {
        public override TranscriptEvent? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var document = JsonDocument.ParseValue(ref reader);
            if (
                document.RootElement.TryGetProperty("type", out var typeElement)
                && typeElement.GetString() != "transcript"
            )
            {
                throw new JsonException(
                    $"Expected literal 'type' to be 'transcript', got '{typeElement.GetString()}'"
                );
            }
            return document.Deserialize<TranscriptEvent>(JsonOptions.JsonSerializerOptions);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TranscriptEvent value,
            JsonSerializerOptions options
        )
        {
            JsonSerializer.Serialize(writer, value, JsonOptions.JsonSerializerOptions);
        }
    }
}
