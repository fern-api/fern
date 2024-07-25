using System;
using SeedPagination;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public partial class SeedPaginationClient
{
    private RawClient _client;

    public SeedPaginationClient(string token, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Users = new UsersClient(_client);
    }

    public UsersClient Users { get; init; }
}
