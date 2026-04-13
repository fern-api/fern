using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record OrganizationsGetOrganizationRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
