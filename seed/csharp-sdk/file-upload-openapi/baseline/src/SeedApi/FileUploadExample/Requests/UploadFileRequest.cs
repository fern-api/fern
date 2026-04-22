using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UploadFileRequest
{
    public required string Name { get; set; }

    public FileParameter? File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
