using System.Text.Json.Serialization;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory;

public record Organization
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("users")]
    public IEnumerable<User> Users { get; set; } = new List<User>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
