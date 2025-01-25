using SeedNullable.Core;

#nullable enable

namespace SeedNullable;

public record GetUsersRequest
{
    public IEnumerable<string> Usernames { get; set; } = new List<string>();

    public string? Avatar { get; set; }

    public IEnumerable<bool> Activated { get; set; } = new List<bool>();

    public IEnumerable<string> Tags { get; set; } = new List<string>();

    public bool? Extra { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
