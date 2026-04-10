using SeedApi.Core;

namespace SeedApi;

public partial class QueryparamClient : IQueryparamClient
{
    private readonly RawClient _client;

    internal QueryparamClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Queryparam.SendAsync(
    ///     new QueryParamSendRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
    /// );
    /// </code></example>
    public async Task SendAsync(
        QueryParamSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 4)
            .Add("operand", request.Operand)
            .Add("maybeOperand", request.MaybeOperand)
            .Add("operandOrColor", request.OperandOrColor)
            .AddDeepObject("maybeOperandOrColor", request.MaybeOperandOrColor)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
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
                    Path = "query",
                    QueryString = _queryString,
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

    /// <example><code>
    /// await client.Queryparam.SendlistAsync(
    ///     new QueryParamSendListRequest
    ///     {
    ///         Operand = [Operand.GreaterThan],
    ///         MaybeOperand = [Operand.GreaterThan],
    ///         OperandOrColor = [Color.Red],
    ///         MaybeOperandOrColor = [Color.Red],
    ///     }
    /// );
    /// </code></example>
    public async Task SendlistAsync(
        QueryParamSendListRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 4)
            .Add("operand", request.Operand)
            .Add("maybeOperand", request.MaybeOperand)
            .AddDeepObject("operandOrColor", request.OperandOrColor)
            .AddDeepObject("maybeOperandOrColor", request.MaybeOperandOrColor)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
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
                    Path = "query-list",
                    QueryString = _queryString,
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
