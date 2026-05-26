using SeedApi.V1;
using SeedApi.V2;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IV1Client V1 { get; }
    public IV2Client V2 { get; }
}
