using System.Text.Json;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<Movie> GetMovieAsync(string movieId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/movie/{movieId}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Movie>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<string> CreateMovieAsync(Movie request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/movie",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<object> GetMetadataAsync(GetMetadataRequest request)
    {
        var _query = new Dictionary<string, object>() { };
        if (request.Shallow != null)
        {
            _query["shallow"] = request.Shallow;
        }
        if (request.Tag != null)
        {
            _query["tag"] = request.Tag;
        }
        var _headers = new Dictionary<string, string>()
        {
            { "X-API-Version", request.XApiVersion },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/metadata",
                Query = _query,
                Headers = _headers
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<object>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<Response> GetResponseAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = "/response" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Response>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
