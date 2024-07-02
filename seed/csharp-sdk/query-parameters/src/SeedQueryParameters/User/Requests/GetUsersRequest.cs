using SeedQueryParameters;

#nullable enable

namespace SeedQueryParameters;

public class GetUsersRequest
{
    public int Limit { get; init; }

    public Guid Id { get; init; }

    public DateOnly Date { get; init; }

    public DateTime Deadline { get; init; }

    public string Bytes { get; init; }

    public User User { get; init; }

    public IEnumerable<User> UserList { get; init; }

    public DateTime? OptionalDeadline { get; init; }

    public Dictionary<string, string> KeyValue { get; init; }

    public string? OptionalString { get; init; }

    public NestedUser NestedUser { get; init; }

    public User? OptionalUser { get; init; }

    public User ExcludeUser { get; init; }

    public string Filter { get; init; }
}
