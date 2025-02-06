using SeedPathParameters.Core;

namespace SeedPathParameters;

public record SearchOrganizationsRequest
{
    public int? Limit { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
