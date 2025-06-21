using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record JustFileRequest
{
    public required FileParameter File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
