using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record GetCatalogImageRequest
{
    [JsonIgnore]
    public required string ImageId { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
