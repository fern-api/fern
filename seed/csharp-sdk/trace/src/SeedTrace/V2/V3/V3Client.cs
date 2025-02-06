using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public partial class V3Client
{
    private RawClient _client;

    internal V3Client(RawClient client)
    {
        _client = client;
        Problem = new ProblemClient(_client);
    }

    public ProblemClient Problem { get; }
}
