using System.Net.Http;
using System.Text.Json;
using System.Threading;

namespace SeedExamples.File.Notification;

public partial class ServiceClient
{
    private SeedExamples.Core.RawClient _client;

    internal ServiceClient(SeedExamples.Core.RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.File.Notification.Service.GetExceptionAsync("notification-hsy129x");
    /// </code></example>
    public async Task<SeedExamples.Exception> GetExceptionAsync(
        string notificationId,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/file/notification/{0}",
                        SeedExamples.Core.ValueConvert.ToPathParameterString(notificationId)
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
                return SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Exception>(
                    responseBody
                )!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
