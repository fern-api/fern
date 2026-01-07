using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial interface IPrimitiveClient
{
    Task<string> GetAndReturnStringAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<int> GetAndReturnIntAsync(
        int request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<long> GetAndReturnLongAsync(
        long request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<double> GetAndReturnDoubleAsync(
        double request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> GetAndReturnBoolAsync(
        bool request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<DateTime> GetAndReturnDatetimeAsync(
        DateTime request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<DateOnly> GetAndReturnDateAsync(
        DateOnly request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> GetAndReturnUuidAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> GetAndReturnBase64Async(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
