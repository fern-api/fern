using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// Tests that a struct with a required field whose type extends a non-Default
/// base type does NOT incorrectly derive Default in Rust. Reproduces the bug
/// where namedTypeSupportsDefault only checked properties but not extends.
/// </summary>
[Serializable]
public record ObjectWithRequiredExtendedField : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("requiredExtended")]
    public required ExtendedObjectWithInheritedEnum RequiredExtended { get; set; }

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
