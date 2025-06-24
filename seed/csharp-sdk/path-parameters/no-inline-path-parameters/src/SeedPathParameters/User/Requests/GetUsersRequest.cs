using SeedPathParameters.Core;

namespace SeedPathParameters;

[Serializable]
public record GetUsersRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
