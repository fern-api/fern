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
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", AppendAppInfoToUserAgent(BuildUserAgent(), clientOptions.AppInfo) },
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
        return $"Fernimdb/{Version.Current}{platform}{runtime}";
    }

    private static string AppendAppInfoToUserAgent(string userAgent, AppInfo? appInfo)
    {
        if (appInfo == null)
        {
            return userAgent;
        }
        static string EncodeToken(string value)
        {
            var builder = new global::System.Text.StringBuilder(value.Length);
            foreach (var ch in value)
            {
                if (
                    (ch >= 'a' && ch <= 'z')
                    || (ch >= 'A' && ch <= 'Z')
                    || (ch >= '0' && ch <= '9')
                    || "!#$%&'*+-.^_`|~".IndexOf(ch) >= 0
                )
                {
                    builder.Append(ch);
                }
                else
                {
                    AppendPercentEncoded(builder, ch);
                }
            }
            return builder.ToString();
        }
        static string EncodeComment(string value)
        {
            var builder = new global::System.Text.StringBuilder(value.Length);
            foreach (var ch in value)
            {
                if (ch == '(' || ch == ')' || ch == '\\' || ch <= '\u001f' || ch == '\u007f')
                {
                    AppendPercentEncoded(builder, ch);
                }
                else
                {
                    builder.Append(ch);
                }
            }
            return builder.ToString();
        }
        static void AppendPercentEncoded(global::System.Text.StringBuilder builder, char ch)
        {
            foreach (var b in global::System.Text.Encoding.UTF8.GetBytes(new[] { ch }))
            {
                builder.Append('%').Append(b.ToString("X2"));
            }
        }
        var name = EncodeToken((appInfo.Name ?? string.Empty).Trim());
        if (name.Length == 0)
        {
            return userAgent;
        }
        var productToken = name;
        var version = EncodeToken((appInfo.Version ?? string.Empty).Trim());
        if (version.Length > 0)
        {
            productToken += "/" + version;
        }
        var comment = EncodeComment((appInfo.Comment ?? string.Empty).Trim());
        if (comment.Length > 0)
        {
            productToken += " (" + comment + ")";
        }
        return userAgent + " " + productToken;
    }
}
