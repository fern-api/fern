namespace SeedCsharpNamespaceCollision.Core;

internal sealed class HeaderValue
{
    private readonly Func<ValueTask<string>> _resolver;

    public HeaderValue(string value)
    {
        _resolver = () => new ValueTask<string>(value);
    }

    public HeaderValue(Func<string> value)
    {
        _resolver = () => new ValueTask<string>(value());
    }

    public HeaderValue(Func<ValueTask<string>> value)
    {
        _resolver = value;
    }

    public HeaderValue(Func<Task<string>> value)
    {
        _resolver = () => new ValueTask<string>(value());
    }

    public static implicit operator HeaderValue(string value) => new(value);

    public static implicit operator HeaderValue(Func<string> value) => new(value);

    public static implicit operator HeaderValue(Func<ValueTask<string>> value) => new(value);

    public static implicit operator HeaderValue(Func<Task<string>> value) => new(value);

    public static HeaderValue FromString(string value) => new(value);

    public static HeaderValue FromFunc(Func<string> value) => new(value);

    public static HeaderValue FromValueTaskFunc(Func<ValueTask<string>> value) => new(value);

    public static HeaderValue FromTaskFunc(Func<Task<string>> value) => new(value);

    internal ValueTask<string> ResolveAsync() => _resolver();
}
