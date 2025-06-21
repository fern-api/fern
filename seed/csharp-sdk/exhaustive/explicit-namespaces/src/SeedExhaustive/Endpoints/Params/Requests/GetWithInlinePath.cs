using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

[Serializable]
public record GetWithInlinePath
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
