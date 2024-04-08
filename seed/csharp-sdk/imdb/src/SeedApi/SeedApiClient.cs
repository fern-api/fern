using SeedApi;

namespace SeedApi;

public partial class SeedApiClient
{
    public SeedApiClient(string token) : this(token, new ClientOptions())
    {
    }
    
    public SeedApiClient (string token, ClientOptions options) {
        
    }
    
    public ImdbClient Imdb { get; }
    
    public BaseClient _Base { get; }
}
