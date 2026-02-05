using SeedCsharpNamespaceCollision.System;

namespace SeedCsharpNamespaceCollision;

public partial interface ISeedCsharpNamespaceCollisionClient
{
    public ISystemClient System { get; }
    WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Task> CreateTaskAsync(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
