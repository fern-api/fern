using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public class ParamsClient
{
    private RawClient _client;

    public ParamsClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    public async void GetWithPathAsync() { }

    /// <summary>
    /// GET with query param
    /// </summary>
    public async void GetWithQueryAsync() { }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    public async void GetWithAllowMultipleQueryAsync() { }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    public async void GetWithPathAndQueryAsync() { }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    public async void ModifyWithPathAsync() { }
}
