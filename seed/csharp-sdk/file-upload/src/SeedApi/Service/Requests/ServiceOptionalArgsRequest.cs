using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceOptionalArgsRequest
{
    public FileParameter? ImageFile { get; set; }

    public object? Request { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
