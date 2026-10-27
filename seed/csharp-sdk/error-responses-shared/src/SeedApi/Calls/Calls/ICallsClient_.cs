using SeedApi;

namespace SeedApi.Calls;

public partial interface ICallsClient_
{
    WithRawResponseTask<Call> CreateCallAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
