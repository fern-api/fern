using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record InlineTypeRequest
{
    public required FileParameter File { get; set; }

    public required MyInlineType Request { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
