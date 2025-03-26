using SeedPathParameters.Core;

namespace SeedPathParameters;

public record GetOrganizationUserRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
