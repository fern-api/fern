using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record OrganizationsGetOrganizationUserRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
