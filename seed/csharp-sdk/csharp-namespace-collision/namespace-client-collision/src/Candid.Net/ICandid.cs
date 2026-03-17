using Candid.Net.System;

namespace Candid.Net;

public partial interface ICandid
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
