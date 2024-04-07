using SeedApi.Core;

namespace SeedApi;

public class SeedApi
{
    public SeedApi(string apiKey) : this(apiKey, new ClientOptions()) {}
    
    public SeedApi(string apiKey = null, ClientOptions options = null)
    {
        if (apiKey == null)
        {
            // try to load from env or throw
        }
        Imdb = new ImdbClient();
    }
    
    public ImdbClient Imdb { get; }
}