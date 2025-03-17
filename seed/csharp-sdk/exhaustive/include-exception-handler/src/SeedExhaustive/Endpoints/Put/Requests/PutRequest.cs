using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public record PutRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
