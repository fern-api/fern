using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UserGetUserRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
