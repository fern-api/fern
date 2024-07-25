using System;
using SeedFileDownload;
using SeedFileDownload.Core;

#nullable enable

namespace SeedFileDownload;

public partial class SeedFileDownloadClient
{
    private RawClient _client;

    public SeedFileDownloadClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }
}
