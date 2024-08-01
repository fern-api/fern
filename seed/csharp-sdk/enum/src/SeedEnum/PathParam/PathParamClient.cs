using System.Net.Http;
using OneOf;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public class PathParamClient
{
    private RawClient _client;

    public PathParamClient(RawClient client)
    {
        _client = client;
    }

    public async Task SendAsync(
        Operand operand,
        Operand? maybeOperand,
        OneOf<Color, Operand> operandOrColor,
        OneOf<Color, Operand>? maybeOperandOrColor,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"path/{operand}/{maybeOperand}/{operandOrColor}/{maybeOperandOrColor}",
                Options = options
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedEnumApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
