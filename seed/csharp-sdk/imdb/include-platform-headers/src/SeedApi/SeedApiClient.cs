using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(string token, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", global::SeedApi.Version.Current },
                { "User-Agent", BuildUserAgent() },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var clientOptionsWithAuth = clientOptions.Clone();
        var authHeaders = new Headers(
            new Dictionary<string, string>() { { "Authorization", $"Bearer {token}" } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Imdb = new ImdbClient(_client);
    }

    public IImdbClient Imdb { get; }

    private static string BuildUserAgent()
    {
        var os =
            global::System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(
                global::System.Runtime.InteropServices.OSPlatform.Windows
            )
                ? "windows"
            : global::System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(
                global::System.Runtime.InteropServices.OSPlatform.Linux
            )
                ? "linux"
            : global::System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(
                global::System.Runtime.InteropServices.OSPlatform.OSX
            )
                ? "osx"
            : "";
        var arch = global::System
            .Runtime.InteropServices.RuntimeInformation.ProcessArchitecture.ToString()
            .ToLowerInvariant();
        arch = arch == "x64" || arch == "amd64" || arch == "x86_64" ? "x86_64" : arch;
        var platform =
            os.Length > 0 && arch.Length > 0 ? $" ({os}; {arch})"
            : os.Length > 0 ? $" ({os})"
            : arch.Length > 0 ? $" ({arch})"
            : "";
        var runtimeVersion = global::System.Environment.Version.ToString();
        var runtime = runtimeVersion.Length > 0 ? $" dotnet/{runtimeVersion}" : " dotnet";
        return $"Fernimdb/{(global::SeedApi.Version.Current)}{platform}{runtime}";
    }
}
