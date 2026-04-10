using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceJustFileRequest
{
    public FileParameter? File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
