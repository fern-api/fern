using SeedApi.Core;

namespace SeedApi;

public record ObjectValue
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
