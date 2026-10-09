namespace SeedApi;

public partial interface IWidgetsClient
{
    WithRawResponseTask<Widget> CreateAsync(
        Widget request,
        string? apiVersion = null,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
