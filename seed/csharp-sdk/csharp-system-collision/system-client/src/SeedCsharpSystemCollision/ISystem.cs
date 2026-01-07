namespace SeedCsharpSystemCollision;

public partial interface ISystem
{
    global::System.Threading.Tasks.Task<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    global::System.Threading.Tasks.Task<Task> CreateTaskAsync(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    global::System.Threading.Tasks.Task EmptyResponseAsync(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
