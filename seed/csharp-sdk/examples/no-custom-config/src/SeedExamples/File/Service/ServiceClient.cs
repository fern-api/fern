using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.File_;

public partial class ServiceClient
{
    private RawClient _client;

    private RawServiceClient _rawClient;

    internal ServiceClient(RawClient client)
    {
        _client = client;
        _rawClient = new RawServiceClient(_client);
        WithRawResponse = _rawClient;
    }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawServiceClient WithRawResponse { get; }

    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    /// <example><code>
    /// await client.File.Service.GetFileAsync(
    ///     "file.txt",
    ///     new GetFileRequest { XFileApiVersion = "0.0.2" }
    /// );
    /// </code></example>
    public async Task<SeedExamples.File> GetFileAsync(
        string filename,
        GetFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .GetFileAsync(filename, request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }
}
