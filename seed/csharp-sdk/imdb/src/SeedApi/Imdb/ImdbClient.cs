using System.Text.Json;
using SeedApi;

#nullable enable

namespace SeedApi;

public class ImdbClient
{
    private RawClient _client;

    public ImdbClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Add a movie to the database
    /// </summary>
    public async Task<string> CreateMovieAsync(CreateMovieRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/movies/create-movie",
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

    public async Task<Movie> GetMovieAsync(string movieId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/movies/{movieId}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Movie>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
