namespace SeedApi;

public partial interface IWidgetsClient
{
    WithRawResponseTask<Widget> CreateAsync(
        Widget request,
        string? tenant = null,
        string? version = null,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
