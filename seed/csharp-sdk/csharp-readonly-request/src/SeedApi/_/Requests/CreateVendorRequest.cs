using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record CreateVendorRequest
{
    /// <summary>
    /// Map of vendor ID to vendor data
    /// </summary>
    [JsonPropertyName("vendors")]
    public Dictionary<string, Vendor> Vendors { get; set; } = new Dictionary<string, Vendor>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
