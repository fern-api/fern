using SeedQueryParameters;

#nullable enable

namespace SeedQueryParameters;

public record GetUsersRequest
{
    public required int Limit { get; }

    public required string Id { get; }

    public required DateOnly Date { get; }

    public required DateTime Deadline { get; }

    public required string Bytes { get; }

    public required User User { get; }

    public IEnumerable<User> UserList { get; } = new List<User>();

    public DateTime? OptionalDeadline { get; }

    public Dictionary<string, string> KeyValue { get; } = new Dictionary<string, string>();

    public string? OptionalString { get; }

    public required NestedUser NestedUser { get; }

    public User? OptionalUser { get; }

    public required User ExcludeUser { get; }

    public required string Filter { get; }
}
