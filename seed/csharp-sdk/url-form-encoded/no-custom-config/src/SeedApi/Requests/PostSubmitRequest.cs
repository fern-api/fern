using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record PostSubmitRequest
{
    /// <summary>
    /// The user's username
    /// </summary>
    [JsonPropertyName("username")]
    public required string Username { get; set; }

    /// <summary>
    /// The user's email address
    /// </summary>
    [JsonPropertyName("email")]
    public required string Email { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
