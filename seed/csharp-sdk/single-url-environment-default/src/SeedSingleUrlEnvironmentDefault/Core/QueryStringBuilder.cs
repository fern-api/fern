using global::System.Buffers;
using global::System.Runtime.CompilerServices;
#if !NET6_0_OR_GREATER
using global::System.Text;
#endif

namespace SeedSingleUrlEnvironmentDefault.Core;

/// <summary>
/// High-performance query string builder with cross-platform optimizations.
/// Uses span-based APIs on .NET 6+ and StringBuilder fallback for older targets.
/// </summary>
internal static class QueryStringBuilder
{
#if NET8_0_OR_GREATER
    private static readonly SearchValues<char> UnreservedChars = SearchValues.Create(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~"
    );
#else
    private const string UnreservedChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";
#endif

#if NET7_0_OR_GREATER
    private static ReadOnlySpan<byte> UpperHexChars => "0123456789ABCDEF"u8;
#else
    private static readonly byte[] UpperHexChars =
    {
        (byte)'0',
        (byte)'1',
        (byte)'2',
        (byte)'3',
        (byte)'4',
        (byte)'5',
        (byte)'6',
        (byte)'7',
        (byte)'8',
        (byte)'9',
        (byte)'A',
        (byte)'B',
        (byte)'C',
        (byte)'D',
        (byte)'E',
        (byte)'F',
    };
#endif

    /// <summary>
    /// Builds a query string from the provided parameters.
    /// </summary>
#if NET6_0_OR_GREATER
    public static string Build(ReadOnlySpan<KeyValuePair<string, string>> parameters)
    {
        if (parameters.IsEmpty)
            return string.Empty;

        var estimatedLength = EstimateLength(parameters);
        if (estimatedLength == 0)
            return string.Empty;

        var bufferSize = Math.Min(estimatedLength * 3, 8192);
        var buffer = ArrayPool<char>.Shared.Rent(bufferSize);

        try
        {
            var written = BuildCore(parameters, buffer);
            return new string(buffer.AsSpan(0, written));
        }
        finally
        {
            ArrayPool<char>.Shared.Return(buffer);
        }
    }

    private static int EstimateLength(ReadOnlySpan<KeyValuePair<string, string>> parameters)
    {
        var estimatedLength = 0;
        foreach (var kvp in parameters)
        {
            estimatedLength += kvp.Key.Length + kvp.Value.Length + 2;
        }
        return estimatedLength;
    }
#endif

    /// <summary>
    /// Builds a query string from the provided parameters.
    /// </summary>
    public static string Build(IEnumerable<KeyValuePair<string, string>> parameters)
    {
#if NET6_0_OR_GREATER
        // Try to get span access for collections that support it
        if (parameters is ICollection<KeyValuePair<string, string>> collection)
        {
            if (collection.Count == 0)
                return string.Empty;

            var array = ArrayPool<KeyValuePair<string, string>>.Shared.Rent(collection.Count);
            try
            {
                collection.CopyTo(array, 0);
                return Build(array.AsSpan(0, collection.Count));
            }
            finally
            {
                ArrayPool<KeyValuePair<string, string>>.Shared.Return(array);
            }
        }

        // Fallback for non-collection enumerables
        using var enumerator = parameters.GetEnumerator();
        if (!enumerator.MoveNext())
            return string.Empty;

        var buffer = ArrayPool<char>.Shared.Rent(4096);
        try
        {
            var position = 0;
            var first = true;

            do
            {
                var kvp = enumerator.Current;

                // Ensure capacity (worst case: 3x for encoding + separators)
                var required = (kvp.Key.Length + kvp.Value.Length + 2) * 3;
                if (position + required > buffer.Length)
                {
                    var newBuffer = ArrayPool<char>.Shared.Rent(buffer.Length * 2);
                    buffer.AsSpan(0, position).CopyTo(newBuffer);
                    ArrayPool<char>.Shared.Return(buffer);
                    buffer = newBuffer;
                }

                buffer[position++] = first ? '?' : '&';
                first = false;

                position += EncodeComponent(kvp.Key.AsSpan(), buffer.AsSpan(position));
                buffer[position++] = '=';
                position += EncodeComponent(kvp.Value.AsSpan(), buffer.AsSpan(position));
            } while (enumerator.MoveNext());

            return first ? string.Empty : new string(buffer.AsSpan(0, position));
        }
        finally
        {
            ArrayPool<char>.Shared.Return(buffer);
        }
#else
        // netstandard2.0 / net462 fallback using StringBuilder
        var sb = new StringBuilder();
        var first = true;

        foreach (var kvp in parameters)
        {
            sb.Append(first ? '?' : '&');
            first = false;

            AppendEncoded(sb, kvp.Key);
            sb.Append('=');
            AppendEncoded(sb, kvp.Value);
        }

        return sb.ToString();
#endif
    }

#if NET6_0_OR_GREATER
    private static int BuildCore(
        ReadOnlySpan<KeyValuePair<string, string>> parameters,
        Span<char> buffer
    )
    {
        var position = 0;
        var first = true;

        foreach (var kvp in parameters)
        {
            buffer[position++] = first ? '?' : '&';
            first = false;

            position += EncodeComponent(kvp.Key.AsSpan(), buffer.Slice(position));
            buffer[position++] = '=';
            position += EncodeComponent(kvp.Value.AsSpan(), buffer.Slice(position));
        }

        return position;
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static int EncodeComponent(ReadOnlySpan<char> input, Span<char> output)
    {
        if (!NeedsEncoding(input))
        {
            input.CopyTo(output);
            return input.Length;
        }

        return EncodeSlow(input, output);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static bool NeedsEncoding(ReadOnlySpan<char> value)
    {
#if NET8_0_OR_GREATER
        return value.ContainsAnyExcept(UnreservedChars);
#else
        foreach (var c in value)
        {
            if (!IsUnreserved(c))
                return true;
        }
        return false;
#endif
    }

    private static int EncodeSlow(ReadOnlySpan<char> input, Span<char> output)
    {
        var position = 0;

        foreach (var c in input)
        {
            if (IsUnreserved(c))
            {
                output[position++] = c;
            }
            else if (c == ' ')
            {
                output[position++] = '%';
                output[position++] = '2';
                output[position++] = '0';
            }
#if NET7_0_OR_GREATER
            else if (char.IsAscii(c))
#else
            else if (c <= 127)
#endif
            {
                position += EncodeAscii((byte)c, output.Slice(position));
            }
            else
            {
                position += EncodeUtf8(c, output.Slice(position));
            }
        }

        return position;
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static int EncodeAscii(byte value, Span<char> output)
    {
        output[0] = '%';
        output[1] = (char)UpperHexChars[value >> 4];
        output[2] = (char)UpperHexChars[value & 0xF];
        return 3;
    }

    private static int EncodeUtf8(char c, Span<char> output)
    {
        Span<byte> utf8Bytes = stackalloc byte[4];
        Span<char> singleChar = stackalloc char[1] { c };
        var byteCount = global::System.Text.Encoding.UTF8.GetBytes(singleChar, utf8Bytes);

        var position = 0;
        for (var i = 0; i < byteCount; i++)
        {
            output[position++] = '%';
            output[position++] = (char)UpperHexChars[utf8Bytes[i] >> 4];
            output[position++] = (char)UpperHexChars[utf8Bytes[i] & 0xF];
        }

        return position;
    }
#else
    // netstandard2.0 / net462 StringBuilder-based encoding
    private static void AppendEncoded(StringBuilder sb, string value)
    {
        foreach (var c in value)
        {
            if (IsUnreserved(c))
            {
                sb.Append(c);
            }
            else if (c == ' ')
            {
                sb.Append("%20");
            }
            else if (c <= 127)
            {
                AppendPercentEncoded(sb, (byte)c);
            }
            else
            {
                var bytes = Encoding.UTF8.GetBytes(new[] { c });
                foreach (var b in bytes)
                {
                    AppendPercentEncoded(sb, b);
                }
            }
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static void AppendPercentEncoded(StringBuilder sb, byte value)
    {
        sb.Append('%');
        sb.Append((char)UpperHexChars[value >> 4]);
        sb.Append((char)UpperHexChars[value & 0xF]);
    }
#endif

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static bool IsUnreserved(char c)
    {
#if NET8_0_OR_GREATER
        return UnreservedChars.Contains(c);
#elif NET7_0_OR_GREATER
        return char.IsAsciiLetterOrDigit(c) || c is '-' or '_' or '.' or '~';
#else
        return (c >= 'A' && c <= 'Z')
            || (c >= 'a' && c <= 'z')
            || (c >= '0' && c <= '9')
            || c == '-'
            || c == '_'
            || c == '.'
            || c == '~';
#endif
    }

    /// <summary>
    /// Fluent builder for constructing query strings with support for simple parameters and deep object notation.
    /// </summary>
    public sealed class Builder
    {
        private readonly List<KeyValuePair<string, string>> _params;

        /// <summary>
        /// Initializes a new instance with default capacity.
        /// </summary>
        public Builder()
        {
            _params = new List<KeyValuePair<string, string>>();
        }

        /// <summary>
        /// Initializes a new instance with the specified initial capacity.
        /// </summary>
        public Builder(int capacity)
        {
            _params = new List<KeyValuePair<string, string>>(capacity);
        }

        /// <summary>
        /// Adds a simple parameter.
        /// </summary>
        public Builder Add(string key, object? value)
        {
            if (value is not null)
            {
                _params.Add(
                    new KeyValuePair<string, string>(key, ValueConvert.ToQueryStringValue(value))
                );
            }
            return this;
        }

        /// <summary>
        /// Adds a complex object using deep object notation with a prefix.
        /// Deep object notation nests properties with brackets: prefix[key][nested]=value
        /// </summary>
        public Builder AddDeepObject(string prefix, object? value)
        {
            if (value is not null)
            {
                _params.AddRange(QueryStringConverter.ToDeepObject(prefix, value));
            }
            return this;
        }

        /// <summary>
        /// Adds a complex object using exploded form notation with an optional prefix.
        /// Exploded form flattens properties: prefix[key]=value (no deep nesting).
        /// </summary>
        public Builder AddExploded(string prefix, object? value)
        {
            if (value is not null)
            {
                _params.AddRange(QueryStringConverter.ToExplodedForm(prefix, value));
            }
            return this;
        }

        /// <summary>
        /// Builds the final query string.
        /// </summary>
        public string Build()
        {
            return QueryStringBuilder.Build(_params);
        }
    }
}
