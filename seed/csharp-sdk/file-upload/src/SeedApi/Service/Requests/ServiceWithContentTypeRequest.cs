using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceWithContentTypeRequest
{
    public FileParameter? File { get; set; }

    public string? Foo { get; set; }

    public MyObject? Bar { get; set; }

    public MyObject? FooBar { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
