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
        OneOf<Color, Operand>? maybeOperandOrColor
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"path/{operand}/{maybeOperand}/{operandOrColor}/{maybeOperandOrColor}"
            }
        );
    }
}
