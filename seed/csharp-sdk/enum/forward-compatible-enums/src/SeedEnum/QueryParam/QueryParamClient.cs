using SeedEnum.Core;

namespace SeedEnum;

public partial class QueryParamClient : IQueryParamClient
{
    private RawClient _client;

    internal QueryParamClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.QueryParam.SendAsync(
    ///     new SendEnumAsQueryParamRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
    /// );
    /// </code></example>
    public async Task SendAsync(
        SendEnumAsQueryParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedEnum.Core.QueryStringBuilder.Builder(capacity: 4)
            .Add("operand", request.Operand)
            .Add("maybeOperand", request.MaybeOperand)
            .AddDeepObject("operandOrColor", request.OperandOrColor)
            .AddDeepObject("maybeOperandOrColor", request.MaybeOperandOrColor)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "query",
                    QueryString = _queryString,
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedEnumApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.QueryParam.SendListAsync(
    ///     new SendEnumListAsQueryParamRequest
    ///     {
    ///         Operand = [Operand.GreaterThan],
    ///         MaybeOperand = [Operand.GreaterThan],
    ///         OperandOrColor = [Color.Red],
    ///         MaybeOperandOrColor = [Color.Red],
    ///     }
    /// );
    /// </code></example>
    public async Task SendListAsync(
        SendEnumListAsQueryParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedEnum.Core.QueryStringBuilder.Builder(capacity: 4)
            .Add("operand", request.Operand)
            .Add("maybeOperand", request.MaybeOperand)
            .AddDeepObject("operandOrColor", request.OperandOrColor)
            .AddDeepObject("maybeOperandOrColor", request.MaybeOperandOrColor)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "query-list",
                    QueryString = _queryString,
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedEnumApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
