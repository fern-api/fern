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
    public string? Name { get; set; }

    /// <summary>
    /// Returns a new instance with default values applied for unset properties.
    /// </summary>
    public CreateUsernameRequest WithDefaults()
    {
        return this with { Name = Name ?? Defaults.Name };
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    private static class Defaults
    {
        public const string Name = "test";
    }
}
