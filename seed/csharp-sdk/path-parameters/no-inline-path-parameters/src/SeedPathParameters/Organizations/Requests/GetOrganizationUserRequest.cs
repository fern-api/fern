using SeedPathParameters.Core;

namespace SeedPathParameters;

[Serializable]
public record GetOrganizationUserRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
