using OneOf;
using SeedEnum.Core;

namespace SeedEnum;

public partial class PathParamClient : IPathParamClient
{
    private RawClient _client;

    internal PathParamClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public PathParamClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.PathParam.SendAsync(Operand.GreaterThan, Color.Red);
    /// </code></example>
    public async Task SendAsync(
        Operand operand,
        OneOf<Color, Operand> operandOrColor,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.SendAsync(operand, operandOrColor, options, cancellationToken);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> SendAsync(
            Operand operand,
            OneOf<Color, Operand> operandOrColor,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = string.Format(
                            "path/{0}/{1}",
                            ValueConvert.ToPathParameterString(operand),
                            ValueConvert.ToPathParameterString(operandOrColor)
                        ),
                        Options = options,
                    },
                    cancellationToken
                )
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
