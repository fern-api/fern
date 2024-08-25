using System.Net.Http;
using SeedServerSentEvents;
using SeedServerSentEvents.Core;

#nullable enable

namespace SeedServerSentEvents;

public class CompletionsClient
{
    private RawClient _client;

    public CompletionsClient(RawClient client)
    {
        _client = client;
    }

    public async Task StreamAsync(StreamCompletionRequest request, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "stream",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedServerSentEventsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
