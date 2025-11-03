using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class FileUploadExampleClient
{
    private RawClient _client;

    internal FileUploadExampleClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Upload a file to the database
    /// </summary>
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
}
