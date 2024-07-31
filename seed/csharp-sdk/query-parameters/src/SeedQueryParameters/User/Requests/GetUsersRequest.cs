using SeedQueryParameters;

#nullable enable

namespace SeedQueryParameters;

public record GetUsersRequest
{
    public required int Limit { get; set; }

    public required string Id { get; set; }

    public required DateOnly Date { get; set; }

    public required DateTime Deadline { get; set; }

    public required string Bytes { get; set; }

    public required User User { get; set; }

    public IEnumerable<User> UserList { get; set; } = new List<User>();

    public DateTime? OptionalDeadline { get; set; }

    public Dictionary<string, string> KeyValue { get; set; } = new Dictionary<string, string>();

    public string? OptionalString { get; set; }

    public required NestedUser NestedUser { get; set; }

    public User? OptionalUser { get; set; }

    public IEnumerable<User> ExcludeUser { get; set; } = new List<User>();

    public IEnumerable<string> Filter { get; set; } = new List<string>();
}
