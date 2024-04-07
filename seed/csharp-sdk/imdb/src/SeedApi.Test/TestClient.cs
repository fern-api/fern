using SeedApi.Core;

namespace SeedApi.Test;

public class TestClient
{

    public void main()
    {
        var unauth = new SeedApi();
        var client = new SeedApi(
            "aaaa",
            new ClientOptions{
                BaseUrl = "...",
                Timeout = "1232",
                MaxRetries = "2",
            }
        );
        unauth.Imdb.CreateMovie();
        unauth.Imdb.GetMovie();
    }
}
