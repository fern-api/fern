using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

/// <summary>
/// lorem ipsum
/// </summary>
[Serializable]
public record RootType1 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("bar")]
    public required RootType1InlineType1 Bar { get; set; }

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("fooMap")]
    public Dictionary<string, RootType1FooMapValue> FooMap { get; set; } =
        new Dictionary<string, RootType1FooMapValue>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("fooList")]
    public IEnumerable<RootType1FooListItem> FooList { get; set; } =
        new List<RootType1FooListItem>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("fooSet")]
    public HashSet<RootType1FooSetItem> FooSet { get; set; } = new HashSet<RootType1FooSetItem>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("ref")]
    public required ReferenceType Ref { get; set; }

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
