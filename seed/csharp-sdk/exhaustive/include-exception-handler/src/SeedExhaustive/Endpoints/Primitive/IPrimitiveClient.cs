using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public partial interface IPrimitiveClient
{
    WithRawResponseTask<string> GetAndReturnStringAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<int> GetAndReturnIntAsync(
        int request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<long> GetAndReturnLongAsync(
        long request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<double> GetAndReturnDoubleAsync(
        double request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> GetAndReturnBoolAsync(
        bool request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<DateTime> GetAndReturnDatetimeAsync(
        DateTime request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<DateOnly> GetAndReturnDateAsync(
        DateOnly request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> GetAndReturnUuidAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> GetAndReturnBase64Async(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
