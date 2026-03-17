using global::Seed.CsharpNamespaceConflict.Core;

namespace Seed.CsharpNamespaceConflict;

public partial class Seed : ISeed
{
    private readonly RawClient _client;

    public Seed(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "Seed.CsharpNamespaceConflict" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-namespace-conflict/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Tasktest = new TasktestClient(_client);
    }

    public ITasktestClient Tasktest { get; }
}
