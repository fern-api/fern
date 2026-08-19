namespace SeedVersion.Core;

internal sealed class HeaderValue
{
    private readonly Func<global::System.Threading.Tasks.ValueTask<string>> _resolver;

    public HeaderValue(string value)
    {
        _resolver = () => new global::System.Threading.Tasks.ValueTask<string>(value);
    }

    public HeaderValue(Func<string> value)
    {
        _resolver = () => new global::System.Threading.Tasks.ValueTask<string>(value());
    }

    public HeaderValue(Func<global::System.Threading.Tasks.ValueTask<string>> value)
    {
        _resolver = value;
    }

    public HeaderValue(Func<global::System.Threading.Tasks.Task<string>> value)
    {
        _resolver = () => new global::System.Threading.Tasks.ValueTask<string>(value());
    }

    public static implicit operator HeaderValue(string value) => new(value);

    public static implicit operator HeaderValue(Func<string> value) => new(value);

    public static implicit operator HeaderValue(
        Func<global::System.Threading.Tasks.ValueTask<string>> value
    ) => new(value);

    public static implicit operator HeaderValue(
        Func<global::System.Threading.Tasks.Task<string>> value
    ) => new(value);

    public static HeaderValue FromString(string value) => new(value);

    public static HeaderValue FromFunc(Func<string> value) => new(value);

    public static HeaderValue FromValueTaskFunc(
        Func<global::System.Threading.Tasks.ValueTask<string>> value
    ) => new(value);

    public static HeaderValue FromTaskFunc(
        Func<global::System.Threading.Tasks.Task<string>> value
    ) => new(value);

    internal global::System.Threading.Tasks.ValueTask<string> ResolveAsync() => _resolver();
}
