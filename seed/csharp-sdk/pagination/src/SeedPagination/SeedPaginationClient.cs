using System;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

internal partial class SeedPaginationClient
{
    public SeedPaginationClient(string token, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Users = new UsersClient(_client);
    }

    public RawClient _client;

    public UsersClient Users { get; init; }
}
