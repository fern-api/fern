using SeedPathParameters.Core;

#nullable enable

namespace SeedPathParameters;

public record GetUsersRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
