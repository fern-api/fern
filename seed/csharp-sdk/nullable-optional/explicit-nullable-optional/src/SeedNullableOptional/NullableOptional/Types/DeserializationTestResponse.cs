using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Response for deserialization test
/// </summary>
[Serializable]
public record DeserializationTestResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("echo")]
    public required DeserializationTestRequest Echo { get; set; }

    [JsonPropertyName("processedAt")]
    public required DateTime ProcessedAt { get; set; }

    [JsonPropertyName("nullCount")]
    public required int NullCount { get; set; }

    [JsonPropertyName("presentFieldsCount")]
    public required int PresentFieldsCount { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
