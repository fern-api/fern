using SeedExamples.Core;
using System.Threading.Tasks;
using SeedExamples;
using System.Threading;
using System.Net.Http;
using System.Text.Json;

    namespace SeedExamples.File;

public partial class ServiceClient
{
    private RawClient _client;
    internal ServiceClient (RawClient client) {
        _client = client;
    }

    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    /// <example>
    /// <code>
    /// await client.File.Service.GetFileAsync(
    ///     "file.txt",
    ///     new GetFileRequest { XFileApiVersion = "0.0.2" }
    /// );
    /// </code>
    /// </example>
    public async Task<File> GetFileAsync(string filename, GetFileRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _headers = new Headers(
            new Dictionary<string, string>() {
                { "X-File-API-Version", request.XFileApiVersion }, 
            }
        );
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = $"/file/{filename}", Headers = _headers, Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<File>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamplesException("Failed to deserialize response", e);
            }
        }
        
        try
        {
            switch (response.StatusCode){
                case 404:
                    throw new NotFoundError(JsonUtils.Deserialize<string>(responseBody));
                    }
                }
                catch (
                JsonException)
                {
                    // unable to map error response, throwing generic error
                }
                throw new SeedExamplesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }

        }
