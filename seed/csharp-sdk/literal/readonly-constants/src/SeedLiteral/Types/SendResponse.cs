using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(SendResponse.JsonConverter))]
[Serializable]
public record SendResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("message")]
    public required string Message { get; set; }

    [JsonPropertyName("status")]
    public required int Status { get; set; }

    [JsonPropertyName("success")]
    public bool Success => true;

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal sealed class JsonConverter : JsonConverter<SendResponse>
    {
        public override SendResponse? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var document = JsonDocument.ParseValue(ref reader);
            return document.Deserialize<SendResponse>(JsonOptions.JsonSerializerOptions);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendResponse value,
            JsonSerializerOptions options
        )
        {
            JsonSerializer.Serialize(writer, value, JsonOptions.JsonSerializerOptions);
        }
    }
}
