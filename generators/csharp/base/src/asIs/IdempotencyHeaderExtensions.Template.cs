namespace <%= namespace%>;

/// <summary>
/// Extension helpers for the auto-generated idempotency-key header. Keeps the header name and the
/// freshly generated key in a single location instead of repeating them at every endpoint call site.
/// </summary>
internal static class IdempotencyHeaderExtensions
{
    private const string IdempotencyKeyHeaderName = "<%= context.getIdempotencyKeyGenerationHeaderName()%>";

    /// <summary>
    /// Adds a freshly generated idempotency-key header to the builder.
    /// </summary>
    internal static HeadersBuilder.Builder AddIdempotencyHeader(this HeadersBuilder.Builder builder)
    {
        return builder.Add(IdempotencyKeyHeaderName, global::System.Guid.NewGuid().ToString());
    }
}
