using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceWithInlineTypeRequest
{
    public FileParameter? File { get; set; }

    public MyInlineType? Request { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
