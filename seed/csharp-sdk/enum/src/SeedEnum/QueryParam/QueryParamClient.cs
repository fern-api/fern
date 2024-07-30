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
        var _query = new Dictionary<string, object>() { };
        _query["operand"] = JsonSerializer.Serialize(request.Operand);
        _query["operandOrColor"] = request.OperandOrColor.ToString();

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
        var _query = new Dictionary<string, object>() { };

        var _operand = new List<string>();
        foreach (var _value in request.Operand)
        {
            _operand.Add(JsonSerializer.Serialize(_value));
        }
        _query["operand"] = _operand;

        var _maybeOperand = new List<string>();
        foreach (var _value in request.MaybeOperand)
        {
            if (_value != null)
            {
                _maybeOperand.Add(JsonSerializer.Serialize(_value.Value));
            }
        }
        _query["maybeOperand"] = _maybeOperand;

        var _operandOrColor = new List<string>();
        foreach (var _value in request.OperandOrColor)
        {
            _operandOrColor.Add(_value.ToString());
        }
        _query["operandOrColor"] = _operandOrColor;

        var _maybeOperandOrColor = new List<string>();
        foreach (var _value in request.MaybeOperandOrColor)
        {
            if (_value != null)
            {
                _maybeOperandOrColor.Add(_value.ToString());
            }
        }
        _query["maybeOperandOrColor"] = _maybeOperandOrColor;

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
