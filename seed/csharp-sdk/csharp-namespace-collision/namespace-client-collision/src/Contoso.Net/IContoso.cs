using global::Contoso.Net.System;

namespace Contoso.Net;

public partial interface IContoso
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
