using SeedApi.Core;

namespace SeedApi;

public partial class PathparamClient : IPathparamClient
{
    private readonly RawClient _client;

    internal PathparamClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Pathparam.SendAsync(
    ///     new PathParamSendRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
    /// );
    /// </code></example>
    public async Task SendAsync(
        PathParamSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "path/{0}/{1}",
                        ValueConvert.ToPathParameterString(request.Operand),
                        ValueConvert.ToPathParameterString(request.OperandOrColor)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
