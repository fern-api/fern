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

    /// <example><code>
    /// await client.PathParam.SendAsync(Operand.GreaterThan, Color.Red);
    /// </code></example>
    public async Task SendAsync(
        Operand operand,
        OneOf<Color, Operand> operandOrColor,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "path/{0}/{1}",
                        ValueConvert.ToPathParameterString(operand),
                        ValueConvert.ToPathParameterString(operandOrColor)
                    ),
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
