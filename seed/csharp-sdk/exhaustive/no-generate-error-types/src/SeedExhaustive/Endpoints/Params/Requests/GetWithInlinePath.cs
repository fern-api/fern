using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public record GetWithInlinePath
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
