using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory;

public partial class SeedMixedFileDirectoryClient : ISeedMixedFileDirectoryClient
{
    private readonly RawClient _client;

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
        Organization = new OrganizationClient(_client);
        User = new UserClient(_client);
    }

    public OrganizationClient Organization { get; }

    public UserClient User { get; }
}
