using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Put;

public record PutRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
