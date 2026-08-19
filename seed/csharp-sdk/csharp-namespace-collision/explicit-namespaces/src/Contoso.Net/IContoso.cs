using global::Contoso.Net.ScimConfiguration;
using global::Contoso.Net.System;

namespace Contoso.Net;

public partial interface IContoso
{
    public IScimConfigurationClient ScimConfiguration { get; }
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
