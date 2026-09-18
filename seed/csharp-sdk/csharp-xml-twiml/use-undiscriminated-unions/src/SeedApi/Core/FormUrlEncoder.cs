using global::System.Net.Http;

namespace SeedApi.Core;

/// <summary>
/// Encodes an object into a form URL-encoded content.
/// </summary>
public static class FormUrlEncoder
{
    /// <summary>
    /// Encodes an object into a form URL-encoded content using Deep Object notation.
    /// </summary>
    /// <param name="value">Object to form URL-encode. You can pass in an object or dictionary, but not lists, strings, or primitives.</param>
    /// <exception cref="Exception">Throws when passing in a list, a string, or a primitive value.</exception>
    internal static FormUrlEncodedContent EncodeAsDeepObject(object value) =>
        new(QueryStringConverter.ToDeepObject(value));

    /// <summary>
    /// Encodes an object into a form URL-encoded content using Exploded Form notation.
    /// </summary>
    /// <param name="value">Object to form URL-encode. You can pass in an object or dictionary, but not lists, strings, or primitives.</param>
    /// <exception cref="Exception">Throws when passing in a list, a string, or a primitive value.</exception>
    internal static FormUrlEncodedContent EncodeAsExplodedForm(object value) =>
        new(QueryStringConverter.ToExplodedForm(value));

    /// <summary>
    /// Encodes an object into a form URL-encoded content using Form notation without exploding parameters.
    /// </summary>
    /// <param name="value">Object to form URL-encode. You can pass in an object or dictionary, but not lists, strings, or primitives.</param>
    /// <exception cref="Exception">Throws when passing in a list, a string, or a primitive value.</exception>
    internal static FormUrlEncodedContent EncodeAsForm(object value) =>
        new(QueryStringConverter.ToForm(value));
}
