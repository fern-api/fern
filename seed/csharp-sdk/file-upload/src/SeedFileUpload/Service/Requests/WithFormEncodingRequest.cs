using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record WithFormEncodingRequest
{
    public required FileParameter File { get; set; }

    public required string Foo { get; set; }

    public required MyObject Bar { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
