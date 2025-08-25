using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Nested object for testing
/// </summary>
[Serializable]
public record Address : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("street")]
    public required string Street { get; set; }

    [JsonPropertyName("city")]
    public string? City { get; set; }

    [JsonPropertyName("state")]
    public string? State { get; set; }

    [JsonPropertyName("zipCode")]
    public required string ZipCode { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

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
