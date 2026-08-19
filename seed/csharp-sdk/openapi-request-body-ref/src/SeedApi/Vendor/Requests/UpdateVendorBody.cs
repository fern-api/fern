using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UpdateVendorBody
{
    [JsonIgnore]
    public required string VendorId { get; set; }

    [JsonIgnore]
    public required UpdateVendorRequest Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
