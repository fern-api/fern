namespace SeedApi;

public partial interface IEndpointsPrimitiveClient
{
    WithRawResponseTask<string> EndpointsPrimitiveGetAndReturnStringAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<int> EndpointsPrimitiveGetAndReturnIntAsync(
        int request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<long> EndpointsPrimitiveGetAndReturnLongAsync(
        long request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<double> EndpointsPrimitiveGetAndReturnDoubleAsync(
        double request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> EndpointsPrimitiveGetAndReturnBoolAsync(
        bool request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<DateTime> EndpointsPrimitiveGetAndReturnDatetimeAsync(
        DateTime request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<DateOnly> EndpointsPrimitiveGetAndReturnDateAsync(
        DateOnly request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> EndpointsPrimitiveGetAndReturnUuidAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> EndpointsPrimitiveGetAndReturnBase64Async(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
