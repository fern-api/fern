using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using OneOf;
using SeedEnum.Core;

namespace SeedEnum;

public partial class PathParamClient
{
    private RawClient _client;

    internal PathParamClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.PathParam.SendAsync(Operand.GreaterThan, Color.Red);
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task SendAsync(
        Operand operand,
        OneOf<Color, Operand> operandOrColor,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path =
                        $"path/{JsonUtils.SerializeAsString(operand)}/{JsonUtils.SerializeAsString(operandOrColor)}",
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
