using SeedApi.Core;

namespace SeedApi;

public partial class InlinedrequestClient : IInlinedrequestClient
{
    private readonly RawClient _client;

    internal InlinedrequestClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Inlinedrequest.SendAsync(
    ///     new InlinedRequestSendRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
    /// );
    /// </code></example>
    public async Task SendAsync(
        InlinedRequestSendRequest request,
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
                    Path = "inlined",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
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
