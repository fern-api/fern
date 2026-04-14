using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

/// <summary>
/// lorem ipsum
/// </summary>
[Serializable]
public record RequestTypeInlineType1 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

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
