using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record WithRefBodyRequest
{
    public FileParameter? ImageFile { get; set; }

    public required MyObject Request { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
