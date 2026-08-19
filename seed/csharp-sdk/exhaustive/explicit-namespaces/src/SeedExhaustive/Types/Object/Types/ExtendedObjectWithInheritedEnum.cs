using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Enum;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// Extends ObjectWithInheritedRequiredEnum, inheriting the required enum field.
/// This type should NOT derive Default in Rust because the parent type
/// has a required enum field.
/// </summary>
[Serializable]
public record ExtendedObjectWithInheritedEnum : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("optionalDescription")]
    public string? OptionalDescription { get; set; }

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
