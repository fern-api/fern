using SeedPathParameters.Core;

namespace SeedPathParameters;

[Serializable]
public record GetUserMetadataRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
