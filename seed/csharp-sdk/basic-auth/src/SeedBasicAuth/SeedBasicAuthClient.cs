using SeedBasicAuth;

namespace SeedBasicAuth;

public partial class SeedBasicAuthClient
{
    public SeedBasicAuthClient (string username, string password){
    }
    public BasicAuthClient BasicAuth { get; }
}
