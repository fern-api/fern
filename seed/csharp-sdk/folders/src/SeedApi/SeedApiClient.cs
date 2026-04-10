using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernfolders/0.0.1" },
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
        Ab = new AbClient(_client);
        Ac = new AcClient(_client);
        Folder = new FolderClient(_client);
        FolderService = new FolderServiceClient(_client);
    }

    public IClient _ { get; }

    public IAbClient Ab { get; }

    public IAcClient Ac { get; }

    public IFolderClient Folder { get; }

    public IFolderServiceClient FolderService { get; }
}
