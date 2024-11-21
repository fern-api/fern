using SeedPathParameters.Core;

#nullable enable

namespace SeedPathParameters;

public record SearchUsersRequest
{
    public int? Limit { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
