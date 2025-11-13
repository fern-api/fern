using SeedEnum.Core;

namespace SeedEnum;

public partial class MultipartFormClient
{
    private RawClient _client;

    internal MultipartFormClient(RawClient client)
    {
        _client = client;
    }

    public async Task MultipartFormAsync(
        MultipartFormRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest_ = new SeedEnum.Core.MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "multipart",
            Options = options,
        };
        multipartFormRequest_.AddJsonPart("color", request.Color);
        multipartFormRequest_.AddJsonPart("maybeColor", request.MaybeColor);
        multipartFormRequest_.AddJsonParts("colorList", request.ColorList);
        multipartFormRequest_.AddJsonParts("maybeColorList", request.MaybeColorList);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedEnumApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
