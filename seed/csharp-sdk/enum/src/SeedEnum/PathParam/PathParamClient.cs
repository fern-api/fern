using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using OneOf;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public partial class PathParamClient
{
    private RawClient _client;

    internal PathParamClient(RawClient client)
    {
        _client = client;
    }

    public async Task SendAsync(
        Operand operand,
        Operand? maybeOperand,
        OneOf<Color, Operand> operandOrColor,
        OneOf<Color, Operand>? maybeOperandOrColor,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"path/{operand}/{maybeOperand}/{operandOrColor}/{maybeOperandOrColor}",
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
