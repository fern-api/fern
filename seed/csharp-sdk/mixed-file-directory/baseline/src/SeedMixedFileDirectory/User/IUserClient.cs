using SeedMixedFileDirectory.User_;

namespace SeedMixedFileDirectory;

public partial interface IUserClient
{
    public IEventsClient Events { get; }

    /// <summary>
    /// List all users.
    /// </summary>
    WithRawResponseTask<IEnumerable<User>> ListAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
