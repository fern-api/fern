using SeedPathParameters.Core;

namespace SeedPathParameters;

[Serializable]
public record GetUserSpecificsRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
