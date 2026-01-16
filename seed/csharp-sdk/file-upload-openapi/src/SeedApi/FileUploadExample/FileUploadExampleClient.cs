using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class FileUploadExampleClient : IFileUploadExampleClient
{
    private RawClient _client;

    internal FileUploadExampleClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public FileUploadExampleClient.RawAccessClient Raw { get; }

    /// <summary>
    /// Upload a file to the database
    /// </summary>
    /// <example><code>
    /// await client.FileUploadExample.UploadFileAsync(new UploadFileRequest { Name = "name" });
    /// </code></example>
    public async Task<string> UploadFileAsync(
        UploadFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "upload-file",
            Options = options,
        };
        multipartFormRequest_.AddStringPart("name", request.Name);
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedApiApiException(
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
        /// Upload a file to the database
        /// </summary>
        public async Task<RawResponse<string>> UploadFileAsync(
            UploadFileRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var multipartFormRequest_ = new MultipartFormRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "upload-file",
                Options = options,
            };
            multipartFormRequest_.AddStringPart("name", request.Name);
            multipartFormRequest_.AddFileParameterPart("file", request.File);
            var response = await _client
                .SendRequestAsync(multipartFormRequest_, cancellationToken)
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<string>(responseBody)!;
                    return new RawResponse<string>
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = new ResponseHeaders(ExtractHeaders(response.Raw)),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedApiException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedApiApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
