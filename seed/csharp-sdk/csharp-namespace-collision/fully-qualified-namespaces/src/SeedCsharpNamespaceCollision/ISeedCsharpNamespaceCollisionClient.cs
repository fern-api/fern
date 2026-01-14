using SeedCsharpNamespaceCollision.System;

namespace SeedCsharpNamespaceCollision;

public partial interface ISeedCsharpNamespaceCollisionClient
{
    public SystemClient System { get; }
    Task<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Task> CreateTaskAsync(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
