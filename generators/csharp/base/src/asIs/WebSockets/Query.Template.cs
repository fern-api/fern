using System.Collections;

namespace <%= namespace%>.WebSockets;

/// <summary>
/// Represents a collection of query parameters that can be used to build URL query strings.
/// Provides type-safe methods for adding various parameter types and supports enumeration.
/// </summary>
public class Query : IEnumerable<KeyValuePair<string, string>>
{
    private readonly List<KeyValuePair<string, string>> _queryParameters = [];

    /// <summary>
    /// Initializes a new instance of the Query class.
    /// </summary>
    public Query() { }

    /// <summary>
    /// Creates a new empty Query instance.
    /// </summary>
    /// <returns>A new Query instance.</returns>
    public static Query Create() => [];

    /// <summary>
    /// Adds a string parameter to the query if both key and value are not null or empty.
    /// </summary>
    /// <param name="key">The parameter key.</param>
    /// <param name="value">The parameter value.</param>
    public void Add(string key, string? value)
    {
        if (string.IsNullOrEmpty(value) || string.IsNullOrEmpty(key))
        {
            return;
        }
        _queryParameters.Add(new KeyValuePair<string, string>(key, value!));
    }

    /// <summary>
    /// Adds a boolean parameter to the query if both key and value are not null.
    /// </summary>
    /// <param name="key">The parameter key.</param>
    /// <param name="value">The parameter value.</param>
    public void Add(string key, bool? value)
    {
        if (value == null || string.IsNullOrEmpty(key))
        {
            return;
        }
        _queryParameters.Add(new KeyValuePair<string, string>(key, value.ToString()!.ToLower()));
    }

    /// <summary>
    /// Adds an integer parameter to the query if both key and value are not null.
    /// </summary>
    /// <param name="key">The parameter key.</param>
    /// <param name="value">The parameter value.</param>
    public void Add(string key, int? value)
    {
        if (value == null || string.IsNullOrEmpty(key))
        {
            return;
        }
        _queryParameters.Add(new KeyValuePair<string, string>(key, value.ToString()!));
    }

    /// <summary>
    /// Adds a float parameter to the query if both key and value are not null.
    /// </summary>
    /// <param name="key">The parameter key.</param>
    /// <param name="value">The parameter value.</param>
    public void Add(string key, float? value)
    {
        if (value == null || string.IsNullOrEmpty(key))
        {
            return;
        }
        _queryParameters.Add(new KeyValuePair<string, string>(key, value.ToString()!));
    }

    /// <summary>
    /// Adds a double parameter to the query if both key and value are not null.
    /// </summary>
    /// <param name="key">The parameter key.</param>
    /// <param name="value">The parameter value.</param>
    public void Add(string key, double? value)
    {
        if (value == null || string.IsNullOrEmpty(key))
        {
            return;
        }
        _queryParameters.Add(new KeyValuePair<string, string>(key, value.ToString()!));
    }

    /// <summary>
    /// Adds a decimal parameter to the query if both key and value are not null.
    /// </summary>
    /// <param name="key">The parameter key.</param>
    /// <param name="value">The parameter value.</param>
    public void Add(string key, decimal? value)
    {
        if (value == null || string.IsNullOrEmpty(key))
        {
            return;
        }
        _queryParameters.Add(new KeyValuePair<string, string>(key, value.ToString()!));
    }

    /// <summary>
    /// Adds a decimal parameter to the query if both key and value are not null.
    /// </summary>
    /// <param name="key">The parameter key.</param>
    /// <param name="value">The parameter value.</param>
    public void Add(string key, Object? value)
    {
        if (value == null || string.IsNullOrEmpty(key))
        {
            return;
        }
        _queryParameters.Add(new KeyValuePair<string, string>(key, value.ToString()!));
    }

    /// <summary>
    /// Converts the query parameters to a URL-encoded query string.
    /// </summary>
    /// <returns>A string representation of the query parameters in the format "key1=value1&key2=value2".</returns>
    public override string ToString()
    {
        return string.Join(
            "&",
            _queryParameters.Select(kvp =>
                $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"
            )
        );
    }

    /// <summary>
    /// Returns an enumerator that iterates through the query parameters.
    /// </summary>
    /// <returns>An enumerator for the query parameters.</returns>
    public IEnumerator<KeyValuePair<string, string>> GetEnumerator()
    {
        return _queryParameters.GetEnumerator();
    }

    /// <summary>
    /// Implicitly converts a Query instance to its string representation.
    /// </summary>
    /// <param name="queryBuilder">The Query instance to convert.</param>
    /// <returns>The string representation of the query parameters.</returns>
    public static implicit operator string(Query queryBuilder)
    {
        return queryBuilder.ToString();
    }

    /// <summary>
    /// Returns a non-generic enumerator that iterates through the query parameters.
    /// </summary>
    /// <returns>A non-generic enumerator for the query parameters.</returns>
    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
