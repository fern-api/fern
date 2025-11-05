using SeedEnum.Core;

namespace SeedEnum;

public partial class QueryParamClient
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
        var _query = new Dictionary<string, object>();
        _query["operand"] = request.Operand.Stringify();
        _query["operandOrColor"] = JsonUtils.Serialize(request.OperandOrColor);
        if (request.MaybeOperand != null)
        {
            _query["maybeOperand"] = request.MaybeOperand.Value.Stringify();
        }
        if (request.MaybeOperandOrColor != null)
        {
            _query["maybeOperandOrColor"] = JsonUtils.Serialize(request.MaybeOperandOrColor);
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "query",
                    Query = _query,
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
        var _query = new Dictionary<string, object>();
        _query["operand"] = request.Operand.Select(_value => _value.Stringify()).ToList();
        _query["maybeOperand"] = request.MaybeOperand.Select(_value => _value.Stringify()).ToList();
        _query["operandOrColor"] = request
            .OperandOrColor.Select(_value => JsonUtils.Serialize(_value))
            .ToList();
        _query["maybeOperandOrColor"] = request
            .MaybeOperandOrColor.Select(_value => JsonUtils.Serialize(_value))
            .ToList();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "query-list",
                    Query = _query,
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
