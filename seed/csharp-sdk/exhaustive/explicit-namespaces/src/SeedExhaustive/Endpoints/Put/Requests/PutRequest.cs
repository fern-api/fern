using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Put;

public record PutRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
