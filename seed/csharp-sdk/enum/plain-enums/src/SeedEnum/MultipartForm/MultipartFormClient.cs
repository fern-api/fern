using SeedEnum.Core;

namespace SeedEnum;

public partial class MultipartFormClient : IMultipartFormClient
{
    private readonly RawClient _client;

    internal MultipartFormClient(RawClient client)
    {
        _client = client;
    }

    private async Task<RawResponse> MultipartFormAsyncCore(
        MultipartFormRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedEnum.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new SeedEnum.Core.MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "multipart",
            Headers = _headers,
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
            return new SeedEnum.RawResponse()
            {
                StatusCode = response.Raw.StatusCode,
                Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedEnumApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedEnum.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    public WithRawResponseTask MultipartFormAsync(
        MultipartFormRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(MultipartFormAsyncCore(request, options, cancellationToken));
    }
}
