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
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient.RawAccessClient Raw { get; }

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
                return JsonUtils.Deserialize<SeedExamples.File>(responseBody)!;
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

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
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
                new Dictionary<string, string>()
                {
                    { "X-File-API-Version", request.XFileApiVersion },
                }
            );
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = string.Format(
                            "/file/{0}",
                            ValueConvert.ToPathParameterString(filename)
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
                    var body = JsonUtils.Deserialize<SeedExamples.File>(responseBody)!;
                    return new RawResponse<SeedExamples.File>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
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
}
