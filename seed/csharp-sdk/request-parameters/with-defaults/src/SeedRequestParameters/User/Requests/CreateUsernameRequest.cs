using System.Text.Json.Serialization;
using SeedRequestParameters.Core;

namespace SeedRequestParameters;

[Serializable]
public record CreateUsernameRequest
{
    [JsonIgnore]
    public IEnumerable<string> Tags { get; set; } = new List<string>();

    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [JsonPropertyName("password")]
    public required string Password { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
