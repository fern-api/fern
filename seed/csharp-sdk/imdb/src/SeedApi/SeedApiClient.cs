using SeedApi;

namespace SeedApi;

/// <summary>
/// 
/// </summary>
public partial class SeedApiClient
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="token"></param>
    /// <param name="clientOptions"></param>
    public SeedApiClient(string token = null, string accountId = null, ClientOptions clientOptions = null)
    {
        token = token ?? GetFromEnvironmentOrThrow(
            "MERGE_API_TOKEN", 
            "The environment variable MERGE_API_TOKEN must be set.");
        accountId = token ?? GetFromEnvironmentOrThrow(
            "MERGE_ACCOUNT_ID", 
            "The environment variable MERGE_ACCOUNT_ID must be set.");
        var client = new RawClient(
            new Dictionary<string, string>()
            {
                { "X-Hume-Api-Key", token },
                { "X-Hume-Version", "1.0.0" }
            },
            clientOptions ?? new ClientOptions()
        );
        Imdb = new ImdbClient(client);
    }
    
    public ImdbClient Imdb { get; }

    private static string GetFromEnvironmentOrThrow(String variable, String message)
    {
        string value = Environment.GetEnvironmentVariable(variable);
        if (value == null)
        {
            throw new Exception(message);
        }
        return value;
    }
}
