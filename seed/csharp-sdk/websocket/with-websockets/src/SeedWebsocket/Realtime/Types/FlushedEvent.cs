using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

[JsonConverter(typeof(FlushedEvent.JsonConverter))]
[Serializable]
public record FlushedEvent : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("type")]
    public string Type => "flushed";

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal sealed class JsonConverter : JsonConverter<FlushedEvent>
    {
        public override FlushedEvent? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var document = JsonDocument.ParseValue(ref reader);
            if (
                document.RootElement.TryGetProperty("type", out var typeElement)
                && typeElement.GetString() != "flushed"
            )
            {
                throw new JsonException(
                    $"Expected literal 'type' to be 'flushed', got '{typeElement.GetString()}'"
                );
            }
            return document.Deserialize<FlushedEvent>(JsonOptions.JsonSerializerOptions);
        }

        public override void Write(
            Utf8JsonWriter writer,
            FlushedEvent value,
            JsonSerializerOptions options
        )
        {
            JsonSerializer.Serialize(writer, value, JsonOptions.JsonSerializerOptions);
        }
    }
}
