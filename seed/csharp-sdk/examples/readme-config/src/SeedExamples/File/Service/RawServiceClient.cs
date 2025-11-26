using System.Text.Json;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.File_;

public partial class RawServiceClient
{
    private RawClient _client;

    internal RawServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    public async Task<RawResponse<SeedExamples.File>> GetFileAsync(
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
                var body = JsonUtils.Deserialize<SeedExamples.File>(responseBody)!;
                return new RawResponse<SeedExamples.File>
                {
                    Body = body,
                    StatusCode = response.StatusCode,
                    Headers = response.Raw.Headers,
                };
            }
            catch (JsonException e)
            {
                throw new SeedExamplesException("Failed to deserialize response", e);
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
}
