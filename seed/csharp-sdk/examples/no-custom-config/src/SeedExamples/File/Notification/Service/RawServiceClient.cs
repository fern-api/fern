using System.Text.Json;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.File_.Notification;

public partial class RawServiceClient
{
    private RawClient _client;

    internal RawServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<RawResponse<SeedExamples.Exception>> GetExceptionAsync(
        string notificationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/file/notification/{0}",
                        ValueConvert.ToPathParameterString(notificationId)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                var body = JsonUtils.Deserialize<SeedExamples.Exception>(responseBody)!;
                return new RawResponse<SeedExamples.Exception>
                {
                    Body = body,
                    StatusCode = response.StatusCode,
                    Headers = response.Raw.Headers,
                };
            }
            catch (JsonException e)
            {
                throw new SeedExamplesException("Failed to deserialize response", e);
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
