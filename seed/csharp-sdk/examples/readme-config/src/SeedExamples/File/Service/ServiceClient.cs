using System.Text.Json;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.File_;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<SeedExamples.File>> GetFileAsyncCore(
        string filename,
        GetFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new Headers(
            new Dictionary<string, string>() { { "X-File-API-Version", request.XFileApiVersion } }
        );
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format("/file/{0}", ValueConvert.ToPathParameterString(filename)),
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
                var responseData = JsonUtils.Deserialize<SeedExamples.File>(responseBody)!;
                return new WithRawResponse<SeedExamples.File>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedExamplesApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 404:
                        throw new NotFoundError(JsonUtils.Deserialize<string>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    /// <example><code>
    /// await client.File.Service.GetFileAsync(
    ///     "file.txt",
    ///     new GetFileRequest { XFileApiVersion = "0.0.2" }
    /// );
    /// </code></example>
    public WithRawResponseTask<SeedExamples.File> GetFileAsync(
        string filename,
        GetFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SeedExamples.File>(
            GetFileAsyncCore(filename, request, options, cancellationToken)
        );
    }
}
