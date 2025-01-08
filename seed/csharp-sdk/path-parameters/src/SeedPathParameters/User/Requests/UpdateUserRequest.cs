using SeedPathParameters.Core;

#nullable enable

namespace SeedPathParameters;

public record UpdateUserRequest
{
    public required User Body { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
