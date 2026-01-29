using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCsharpReadonlyRequest.Core;

namespace SeedCsharpReadonlyRequest;

/// <summary>
/// Request to create vendors
/// </summary>
[Serializable]
public record CreateVendorRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Map of vendor ID to vendor data
    /// </summary>
    [JsonPropertyName("vendors")]
    public Dictionary<string, Vendor> Vendors { get; set; } = new Dictionary<string, Vendor>();

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
