using System.Net.Http;

namespace SeedInferredAuthImplicitApiKey.Core;

/// <summary>
/// The response object returned from the API.
/// </summary>
internal record ApiResponse
{
    internal required int StatusCode { get; init; }

    internal required HttpResponseMessage Raw { get; init; }
}
