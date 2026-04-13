using Contoso.Net;

namespace Contoso.Net._;

public partial interface IClient
{
    WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Contoso.Net.Task> CreateTaskAsync(
        Contoso.Net.Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
