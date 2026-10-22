using SeedApi.Calls;
using SeedApi.Messages;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public ICallsClient Calls { get; }
    public IMessagesClient Messages { get; }
}
