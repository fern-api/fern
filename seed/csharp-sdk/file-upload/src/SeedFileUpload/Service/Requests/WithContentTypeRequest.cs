using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record WithContentTypeRequest
{
    public required FileParameter File { get; set; }

    public required string Foo { get; set; }

    public required MyObject Bar { get; set; }

    public MyObject? FooBar { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
