using SeedEnum;

#nullable enable

namespace SeedEnum;

public class QueryParamClient
{
    private RawClient _client;

    public QueryParamClient(RawClient client)
    {
        _client = client;
    }

    public async void SendAsync(SendEnumAsQueryParamRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "operand", request.Operand.ToString() },
            { "operandOrColor", request.OperandOrColor.ToString() },
        };
        if (request.MaybeOperand != null)
        {
            _query["maybeOperand"] = request.MaybeOperand.ToString();
        }
        if (request.MaybeOperandOrColor != null)
        {
            _query["maybeOperandOrColor"] = request.MaybeOperandOrColor.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "query",
                Query = _query
            }
        );
    }

    public async void SendListAsync(SendEnumListAsQueryParamRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "operand", request.Operand.ToString() },
            { "operandOrColor", request.OperandOrColor.ToString() },
        };
        if (request.MaybeOperand != null)
        {
            _query["maybeOperand"] = request.MaybeOperand.ToString();
        }
        if (request.MaybeOperandOrColor != null)
        {
            _query["maybeOperandOrColor"] = request.MaybeOperandOrColor.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "query-list",
                Query = _query
            }
        );
    }
}
