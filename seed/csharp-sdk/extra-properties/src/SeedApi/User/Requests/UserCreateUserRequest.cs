using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UserCreateUserRequest
{
    [JsonPropertyName("_type")]
    public required UserCreateUserRequestType Type { get; set; }

    [JsonPropertyName("_version")]
    public required UserCreateUserRequestVersion Version { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
