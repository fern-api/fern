using SeedPathParameters.Core;

namespace SeedPathParameters;

public record GetOrganizationUserRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
