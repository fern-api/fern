namespace SeedIdempotencyHeaders.Core;

internal interface IIdempotentRequestOptions : IRequestOptions
{
    public string IdempotencyKey { get; init; }
    public int IdempotencyExpiration { get; init; }
    internal Headers GetIdempotencyHeaders();
}
