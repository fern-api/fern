using SeedEnum.Core;

namespace SeedEnum;

public partial class MultipartFormClient : IMultipartFormClient
{
    private RawClient _client;

    internal MultipartFormClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public MultipartFormClient.WithRawResponseClient Raw { get; }

    public async Task MultipartFormAsync(
        MultipartFormRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.MultipartFormAsync(request, options, cancellationToken);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> MultipartFormAsync(
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
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
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
}
