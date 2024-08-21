using System;
using SeedCrossPackageTypeNames.Core;
using SeedCrossPackageTypeNames.FolderA;
using SeedCrossPackageTypeNames.FolderB;
using SeedCrossPackageTypeNames.FolderC;
using SeedCrossPackageTypeNames.FolderD;

#nullable enable

namespace SeedCrossPackageTypeNames;

public partial class SeedCrossPackageTypeNamesClient
{
    private RawClient _client;

    public SeedCrossPackageTypeNamesClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" } },
            new Dictionary<string, Func<string>>(),
            clientOptions ?? new ClientOptions()
        );
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
