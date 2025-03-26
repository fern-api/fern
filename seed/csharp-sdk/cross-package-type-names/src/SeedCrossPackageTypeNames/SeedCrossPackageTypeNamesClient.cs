using SeedCrossPackageTypeNames.Core;
using SeedCrossPackageTypeNames.FolderA;
using SeedCrossPackageTypeNames.FolderB;
using SeedCrossPackageTypeNames.FolderC;
using SeedCrossPackageTypeNames.FolderD;

namespace SeedCrossPackageTypeNames;

public partial class SeedCrossPackageTypeNamesClient
{
    private readonly RawClient _client;

    public SeedCrossPackageTypeNamesClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCrossPackageTypeNames" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncross-package-type-names/0.0.1" },
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
        Commons = new CommonsClient(_client);
        FolderA = new FolderAClient(_client);
        FolderB = new FolderBClient(_client);
        FolderC = new FolderCClient(_client);
        FolderD = new FolderDClient(_client);
        Foo = new FooClient(_client);
    }

    public CommonsClient Commons { get; init; }

    public FolderAClient FolderA { get; init; }

    public FolderBClient FolderB { get; init; }

    public FolderCClient FolderC { get; init; }

    public FolderDClient FolderD { get; init; }

    public FooClient Foo { get; init; }
}
