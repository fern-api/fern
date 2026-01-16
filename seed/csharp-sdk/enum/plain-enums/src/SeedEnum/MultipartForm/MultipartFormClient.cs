using SeedEnum.Core;

namespace SeedEnum;

public partial class MultipartFormClient : IMultipartFormClient
{
    private RawClient _client;

    internal MultipartFormClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public MultipartFormClient.RawAccessClient Raw { get; }

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

        public async Task<RawResponse<object>> MultipartFormAsync(
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
                return new RawResponse<object>
                {
                    StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object(),
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
