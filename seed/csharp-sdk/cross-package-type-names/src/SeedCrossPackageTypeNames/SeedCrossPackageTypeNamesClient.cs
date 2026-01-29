using SeedCrossPackageTypeNames.Core;
using SeedCrossPackageTypeNames.FolderA;
using SeedCrossPackageTypeNames.FolderD;

namespace SeedCrossPackageTypeNames;

public partial class SeedCrossPackageTypeNamesClient : ISeedCrossPackageTypeNamesClient
{
    private readonly RawClient _client;

    public SeedCrossPackageTypeNamesClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCrossPackageTypeNames" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncross-package-type-names/0.0.1" },
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
        FolderA = new FolderAClient(_client);
        FolderD = new FolderDClient(_client);
        Foo = new FooClient(_client);
    }

    public FolderAClient FolderA { get; }

    public FolderDClient FolderD { get; }

    public FooClient Foo { get; }
}
