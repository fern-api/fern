using SeedCustomAuth.Core;

namespace SeedCustomAuth;

public sealed class UnauthorizedRequest(UnauthorizedRequestErrorBody body)
    : SeedCustomAuthApiException("UnauthorizedRequest", 401, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new UnauthorizedRequestErrorBody Body { get; } = body;
}
