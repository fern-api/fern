using SeedMixedFileDirectory.Core;

#nullable enable

namespace SeedMixedFileDirectory;

public partial class SeedMixedFileDirectoryClient
{
    private RawClient _client;

    public SeedMixedFileDirectoryClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedMixedFileDirectory" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmixed-file-directory/0.0.1" },
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
        Organization = new OrganizationClient(_client);
    }

    public UserClient User { get; init; }

    public OrganizationClient Organization { get; init; }
}
