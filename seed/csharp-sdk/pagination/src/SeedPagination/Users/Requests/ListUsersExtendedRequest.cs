namespace SeedPagination;

public record ListUsersExtendedRequest
{
    public Guid? Cursor { get; init; }
}
