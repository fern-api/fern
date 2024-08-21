using System.Net.Http;
<<<<<<< HEAD
=======
using System.Text.Json;
using System.Threading;
>>>>>>> main
using System.Threading.Tasks;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public partial class QueryParamClient
{
    private RawClient _client;

    internal QueryParamClient(RawClient client)
    {
        _client = client;
    }

    public async Task SendAsync(
        SendEnumAsQueryParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
<<<<<<< HEAD
        var _query = new Dictionary<string, object>() { };
        _query["operand"] = request.Operand.Stringify();
=======
        var _query = new Dictionary<string, object>();
        _query["operand"] = JsonSerializer.Serialize(request.Operand);
>>>>>>> main
        _query["operandOrColor"] = request.OperandOrColor.ToString();
        if (request.MaybeOperand != null)
        {
            _query["maybeOperand"] = request.MaybeOperand.Value.Stringify();
        }
        if (request.MaybeOperandOrColor != null)
        {
            _query["maybeOperandOrColor"] = request.MaybeOperandOrColor.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "query",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedEnumApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    public async Task SendListAsync(
        SendEnumListAsQueryParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
<<<<<<< HEAD
        var _query = new Dictionary<string, object>() { };
        _query["operand"] = request.Operand.Select(_value => _value.Stringify()).ToList();
        _query["maybeOperand"] = request.MaybeOperand.Select(_value => _value.Stringify()).ToList();
=======
        var _query = new Dictionary<string, object>();
        _query["operand"] = request
            .Operand.Select(_value => JsonSerializer.Serialize(_value))
            .ToList();
        _query["maybeOperand"] = request.MaybeOperand.Select(_value => _value.ToString()).ToList();
>>>>>>> main
        _query["operandOrColor"] = request
            .OperandOrColor.Select(_value => _value.ToString())
            .ToList();
        _query["maybeOperandOrColor"] = request
            .MaybeOperandOrColor.Select(_value => _value.ToString())
            .ToList();
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "query-list",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedEnumApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
