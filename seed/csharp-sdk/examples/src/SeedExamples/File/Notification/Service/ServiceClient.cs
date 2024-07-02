using System.Text.Json;
using SeedExamples;

#nullable enable

namespace SeedExamples.File.Notification;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<object> GetExceptionAsync(string notificationId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = $"/file/notification/{notificationId}"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<object>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
