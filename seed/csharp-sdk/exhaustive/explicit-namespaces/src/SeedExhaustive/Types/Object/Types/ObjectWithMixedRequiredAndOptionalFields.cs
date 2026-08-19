using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// Tests that dynamic snippets include all required properties even when
/// the example data only provides a subset. In C#, properties marked as
/// `required` must be set in the object initializer.
/// </summary>
[Serializable]
public record ObjectWithMixedRequiredAndOptionalFields : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("requiredString")]
    public required string RequiredString { get; set; }

    [JsonPropertyName("requiredInteger")]
    public required int RequiredInteger { get; set; }

    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [JsonPropertyName("requiredLong")]
    public required long RequiredLong { get; set; }

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
