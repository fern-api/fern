using SeedEnum;

namespace SeedEnum;

public partial class SeedEnumClient
{
    private RawClient _client;

    public SeedEnumClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        InlinedRequest = 
        new InlinedRequestClient{
            _client}
        PathParam = 
        new PathParamClient{
            _client}
        QueryParam = 
        new QueryParamClient{
            _client}
    }

    public InlinedRequestClient InlinedRequest { get; }

    public PathParamClient PathParam { get; }

    public QueryParamClient QueryParam { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
