namespace SeedMultiUrlEnvironmentNoDefault.Core;

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

    public HeaderValue(Func<global::System.Threading.Tasks.ValueTask<string>> value)
        : this(value, "valueTask") { }

    public HeaderValue(Func<global::System.Threading.Tasks.Task<string>> value)
        : this(value, "task") { }

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

    internal global::System.Threading.Tasks.ValueTask<string> ResolveAsync()
    {
        return _type switch
        {
            "string" => new global::System.Threading.Tasks.ValueTask<string>((string)_value),
            "func" => new global::System.Threading.Tasks.ValueTask<string>(
                ((Func<string>)_value)()
            ),
            "valueTask" => ((Func<global::System.Threading.Tasks.ValueTask<string>>)_value)(),
            "task" => new global::System.Threading.Tasks.ValueTask<string>(
                ((Func<global::System.Threading.Tasks.Task<string>>)_value)()
            ),
            _ => throw new global::System.InvalidOperationException(
                $"Unknown header value type: {_type}"
            ),
        };
    }
}
