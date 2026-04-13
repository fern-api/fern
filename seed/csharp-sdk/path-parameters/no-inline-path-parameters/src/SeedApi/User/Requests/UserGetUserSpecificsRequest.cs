using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UserGetUserSpecificsRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
