using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

public record GetWithInlinePath
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
