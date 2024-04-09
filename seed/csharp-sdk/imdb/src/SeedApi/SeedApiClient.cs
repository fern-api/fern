using SeedApi;

namespace SeedApi;

public partial class SeedApiClient
{
    public SeedApiClient (string token){
    }
    public ImdbClient Imdb { get; }
}
