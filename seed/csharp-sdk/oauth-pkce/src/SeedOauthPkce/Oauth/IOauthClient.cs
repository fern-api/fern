namespace SeedOauthPkce;

public partial interface IOauthClient
{
    /// <summary>
    /// Authorization-code grant with PKCE. `response_type` is a required literal that is
    /// hardcoded by the generated method; `code_challenge_method` is an optional literal
    /// that must still be sent on the wire when provided.
    /// </summary>
    WithRawResponseTask<AuthorizeResponse> AuthorizeAsync(
        AuthorizeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
