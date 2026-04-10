using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Patient : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("resource_type")]
    public required PatientResourceType ResourceType { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("scripts")]
    public IEnumerable<Script> Scripts { get; set; } = new List<Script>();

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("related_resources")]
    public IEnumerable<ResourceList> RelatedResources { get; set; } = new List<ResourceList>();

    [JsonPropertyName("memo")]
    public required Memo Memo { get; set; }

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
