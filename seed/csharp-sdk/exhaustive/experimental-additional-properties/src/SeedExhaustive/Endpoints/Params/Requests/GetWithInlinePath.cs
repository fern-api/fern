using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public record GetWithInlinePath
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
