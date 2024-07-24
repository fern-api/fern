using System.Net.Http;
using SeedExamples;
using SeedExamples.Core;

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
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = $"/movie/{movieId}" }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<Movie>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<string> CreateMovieAsync(Movie request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<object> GetMetadataAsync(GetMetadataRequest request)
    {
        var _query = new Dictionary<string, object>() { };
        if (request.Shallow != null)
        {
            _query["shallow"] = request.Shallow.ToString();
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
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/metadata",
                Query = _query,
                Headers = _headers
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<object>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<Response> GetResponseAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Post, Path = "/response" }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<Response>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
