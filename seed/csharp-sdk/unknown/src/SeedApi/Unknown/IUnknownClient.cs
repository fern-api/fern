namespace SeedApi;

public partial interface IUnknownClient
{
    WithRawResponseTask<IEnumerable<object>> PostAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<object>> PostobjectAsync(
        MyObject request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
