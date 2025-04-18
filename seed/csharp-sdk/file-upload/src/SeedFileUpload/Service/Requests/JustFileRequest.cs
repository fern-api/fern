using SeedFileUpload.Core;

namespace SeedFileUpload;

public record JustFileRequest
{
    public required FileParameter File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
