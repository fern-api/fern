using System.Net.Http;
using System.Text.Json;
using System.Threading;

namespace SeedExamples.File;

public partial class ServiceClient
{
    private SeedExamples.Core.RawClient _client;

    internal ServiceClient(SeedExamples.Core.RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    /// <example><code>
    /// await client.File.Service.GetFileAsync(
    ///     "file.txt",
    ///     new SeedExamples.File.GetFileRequest { XFileApiVersion = "0.0.2" }
    /// );
    /// </code></example>
    public async Task<SeedExamples.File> GetFileAsync(
        string filename,
        SeedExamples.File.GetFileRequest request,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new SeedExamples.Core.Headers(
            new Dictionary<string, string>() { { "X-File-API-Version", request.XFileApiVersion } }
        );
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/file/{0}",
                        SeedExamples.Core.ValueConvert.ToPathParameterString(filename)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.File>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 404:
                        throw new SeedExamples.NotFoundError(
                            SeedExamples.Core.JsonUtils.Deserialize<string>(responseBody)
                        );
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
