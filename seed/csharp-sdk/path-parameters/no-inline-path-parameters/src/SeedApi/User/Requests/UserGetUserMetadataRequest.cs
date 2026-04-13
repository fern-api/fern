using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UserGetUserMetadataRequest
{
    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
