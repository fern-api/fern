using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record CreateCatalogImageBody
{
    public required CreateCatalogImageRequest Request { get; set; }

    public FileParameter? ImageFile { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
