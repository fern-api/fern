using Contoso.Net._;
using Contoso.Net.Core;
using Contoso.Net.Scimconfiguration;
using Contoso.Net.System;

namespace Contoso.Net;

public partial class ContosoClient : IContosoClient
{
    private readonly RawClient _client;

    public ContosoClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "Contoso.Net" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-namespace-collision/0.0.1" },
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
        _ = new Client(_client);
        Scimconfiguration = new ScimconfigurationClient(_client);
        System = new SystemClient(_client);
    }

    public IClient _ { get; }

    public IScimconfigurationClient Scimconfiguration { get; }

    public ISystemClient System { get; }
}
