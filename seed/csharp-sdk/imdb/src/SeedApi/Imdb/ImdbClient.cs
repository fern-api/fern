namespace SeedApi;

public class ImdbClient
{
    private readonly RawClient _client;
    
    public ImdbClient(RawClient client)
    {
        _client = client;
    }
    
    /// <summary>
    /// Add a movie to the database
    /// </summary>
    public async void CreateMovieAsync()
    {
        var response = await _client.MakeRequestAsync(
            HttpMethod.Get,
            "/imdb/movie",
            new RawClient.ApiRequest()
            {
                ContentType = "application/json",
            });
        if (response.StatusCode >= 200 && response.StatusCode <= 400)
        {
            return JSON
        } 
        {
            throw new Exception();
        }
    }
    public async void GetMovieAsync(){
    }
}
