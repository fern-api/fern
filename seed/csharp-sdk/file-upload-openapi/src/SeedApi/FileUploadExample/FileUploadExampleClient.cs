using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class FileUploadExampleClient : IFileUploadExampleClient
{
    private RawClient _client;

    internal FileUploadExampleClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public FileUploadExampleClient.WithRawResponseClient Raw { get; }

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
        var response = await Raw.UploadFileAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// Upload a file to the database
        /// </summary>
        public async Task<WithRawResponse<string>> UploadFileAsync(
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
                    var data = JsonUtils.Deserialize<string>(responseBody)!;
                    return new WithRawResponse<string>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
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
