using SeedTrace;

namespace SeedTrace;

public class StoreTracedTestCaseRequest
{
    public TestCaseResultWithStdout Result { get; init; }

    public List<TraceResponse> TraceResponses { get; init; }
}
