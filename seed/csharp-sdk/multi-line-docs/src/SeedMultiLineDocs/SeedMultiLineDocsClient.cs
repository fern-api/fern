using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs;

public partial class SeedMultiLineDocsClient
{
    private readonly RawClient _client;

    public SeedMultiLineDocsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedMultiLineDocs" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmulti-line-docs/0.0.1" },
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
        User = new UserClient(_client);
    }

    public UserClient User { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
