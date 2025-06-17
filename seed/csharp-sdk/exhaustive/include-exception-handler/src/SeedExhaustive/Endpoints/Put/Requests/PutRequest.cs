using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

[Serializable]
public record PutRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
