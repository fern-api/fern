using SeedPagination.Core;

namespace SeedPagination;

public record ListWithGlobalConfigRequest
{
    public int? Offset { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
