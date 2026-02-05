namespace SeedCsharpNamespaceCollision.Core;

internal sealed class HeaderValue
{
    private readonly object _value;
    private readonly string _type;

    private HeaderValue(object value, string type)
    {
        _value = value;
        _type = type;
    }

    public HeaderValue(string value)
        : this(value, "string") { }

    public HeaderValue(Func<string> value)
        : this(value, "func") { }

    public HeaderValue(Func<ValueTask<string>> value)
        : this(value, "valueTask") { }

    public HeaderValue(Func<Task<string>> value)
        : this(value, "task") { }

    public static implicit operator HeaderValue(string value) => new(value);

    public static implicit operator HeaderValue(Func<string> value) => new(value);

    public static implicit operator HeaderValue(Func<ValueTask<string>> value) => new(value);

    public static implicit operator HeaderValue(Func<Task<string>> value) => new(value);

    public static HeaderValue FromString(string value) => new(value);

    public static HeaderValue FromFunc(Func<string> value) => new(value);

    public static HeaderValue FromValueTaskFunc(Func<ValueTask<string>> value) => new(value);

    public static HeaderValue FromTaskFunc(Func<Task<string>> value) => new(value);

    internal ValueTask<string> ResolveAsync()
    {
        return _type switch
        {
            "string" => new ValueTask<string>((string)_value),
            "func" => new ValueTask<string>(((Func<string>)_value)()),
            "valueTask" => ((Func<ValueTask<string>>)_value)(),
            "task" => new ValueTask<string>(((Func<Task<string>>)_value)()),
            _ => throw new InvalidOperationException($"Unknown header value type: {_type}"),
        };
    }
}
