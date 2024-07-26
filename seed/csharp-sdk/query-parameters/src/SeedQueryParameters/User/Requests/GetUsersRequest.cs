using SeedQueryParameters;

#nullable enable

namespace SeedQueryParameters;

public record GetUsersRequest
{
    public required int Limit { get; init; }

    public required string Id { get; init; }

    public required DateOnly Date { get; init; }

    public required DateTime Deadline { get; init; }

    public required string Bytes { get; init; }

    public required User User { get; init; }

    public IEnumerable<User> UserList { get; init; } = new List<User>();

    public DateTime? OptionalDeadline { get; init; }

    public Dictionary<string, string> KeyValue { get; init; } = new Dictionary<string, string>();

    public string? OptionalString { get; init; }

    public required NestedUser NestedUser { get; init; }

    public User? OptionalUser { get; init; }

    public required User ExcludeUser { get; init; }

    public required string Filter { get; init; }
}
