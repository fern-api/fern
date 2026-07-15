using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

/// <summary>
/// A base object that has a required enum field, preventing Default derive
/// in Rust because enums don't implement Default.
/// </summary>
[Serializable]
public record ObjectWithInheritedRequiredEnum : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("requiredEnum")]
    public required WeatherReport RequiredEnum { get; set; }

    [JsonPropertyName("requiredString")]
    public required string RequiredString { get; set; }

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
