using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

[Serializable]
public record GetWithInlinePath
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
