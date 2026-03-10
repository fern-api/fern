#if !NET5_0_OR_GREATER
namespace SeedErrorProperty.Core;

/// <summary>
/// Polyfill extension providing a <c>ReadAsStringAsync(CancellationToken)</c> overload
/// for target frameworks older than .NET 5, where only the parameterless
/// <c>ReadAsStringAsync()</c> is available.
/// </summary>
internal static class HttpContentExtensions
{
    internal static Task<string> ReadAsStringAsync(
        this HttpContent httpContent,
        CancellationToken cancellationToken
    )
    {
        cancellationToken.ThrowIfCancellationRequested();
        return httpContent.ReadAsStringAsync();
    }
}
#endif
