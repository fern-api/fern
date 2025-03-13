using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

public record GetUsersRequest
{
    [JsonIgnore]
    public IEnumerable<string> Usernames { get; set; } = new List<string>();

    [JsonIgnore]
    public string? Avatar { get; set; }

    [JsonIgnore]
    public IEnumerable<bool> Activated { get; set; } = new List<bool>();

    [JsonIgnore]
    public IEnumerable<string> Tags { get; set; } = new List<string>();

    [JsonIgnore]
    public bool? Extra { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
