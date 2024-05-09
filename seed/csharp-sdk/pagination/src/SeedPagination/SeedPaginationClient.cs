using SeedPagination;

namespace SeedPagination;

public partial class SeedPaginationClient
{
    private RawClient _client;

    public SeedPaginationClient (string token, ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string> {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Users = 
        new UsersClient{
            _client}
    }

    public UsersClient Users { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
