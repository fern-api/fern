using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record GetProductsRequest
{
    [JsonIgnore]
    public required string RegionId { get; set; }

    [JsonIgnore]
    public required string ProductId { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
