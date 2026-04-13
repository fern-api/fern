using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableDeleteUserRequest
{
    /// <summary>
    /// The user to delete.
    /// </summary>
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
