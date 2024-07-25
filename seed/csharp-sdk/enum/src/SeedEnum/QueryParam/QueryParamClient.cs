using System.Net.Http;
using System.Text.Json;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public class QueryParamClient
{
    private RawClient _client;

    public QueryParamClient(RawClient client)
    {
        _client = client;
    }

    public async Task SendAsync(SendEnumAsQueryParamRequest request)
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
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "query",
                Query = _query
            }
        );
    }

    public async Task SendListAsync(SendEnumListAsQueryParamRequest request)
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
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "query-list",
                Query = _query
            }
        );
    }
}
