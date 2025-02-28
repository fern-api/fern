using SeedPathParameters.Core;

namespace SeedPathParameters;

public record GetUsersRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
