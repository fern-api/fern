using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict;

public partial class SeedCsharpNamespaceConflictClient
{
    private readonly RawClient _client;

    public SeedCsharpNamespaceConflictClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpNamespaceConflict" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-namespace-conflict/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Tasktest = new TasktestClient(_client);
    }

    public TasktestClient Tasktest { get; }
}
