using System.Test.Json;
using System.Text.Json;
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
            { "operand", JsonSerializer.Serialize(request.Operand) },
            { "operandOrColor", request.OperandOrColor.ToString() },
        };
        if (request.MaybeOperand != null)
        {
            _query["maybeOperand"] = JsonSerializer.Serialize(request.MaybeOperand.Value);
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
            { "operand", JsonSerializer.Serialize(request.Operand) },
            { "operandOrColor", request.OperandOrColor.ToString() },
        };
        if (request.MaybeOperand != null)
        {
            _query["maybeOperand"] = JsonSerializer.Serialize(request.MaybeOperand.Value);
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
