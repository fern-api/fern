using global::Contoso.Net;

namespace Contoso.Net._;

public partial interface IClient
{
    WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<global::Contoso.Net.Task> CreateTaskAsync(
        global::Contoso.Net.Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
