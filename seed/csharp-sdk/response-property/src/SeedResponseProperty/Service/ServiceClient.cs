using System.Net.Http;
using System.Text.Json;
using SeedResponseProperty;
using SeedResponseProperty.Core;

#nullable enable

namespace SeedResponseProperty;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<Response> GetMovieAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Response>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<Response> GetMovieDocsAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Response>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<StringResponse> GetMovieNameAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<StringResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<Response> GetMovieMetadataAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Response>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<Response?> GetOptionalMovieAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Response?>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<WithDocs?> GetOptionalMovieDocsAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<WithDocs?>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<StringResponse?> GetOptionalMovieNameAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "movie",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<StringResponse?>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
