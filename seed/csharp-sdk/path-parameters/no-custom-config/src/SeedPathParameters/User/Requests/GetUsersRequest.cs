using SeedPathParameters.Core;

namespace SeedPathParameters;

public record GetUsersRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
