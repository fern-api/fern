using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedUndiscriminatedUnionWithResponseProperty.Core;

namespace SeedUndiscriminatedUnionWithResponseProperty;

[Serializable]
public record UnionListResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("data")]
    public IEnumerable<OneOf<VariantA, VariantB, VariantC>> Data { get; set; } =
        new List<OneOf<VariantA, VariantB, VariantC>>();

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
