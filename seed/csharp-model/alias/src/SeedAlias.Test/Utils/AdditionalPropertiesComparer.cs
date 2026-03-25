using global::System.Collections;
using global::System.Text.Json;
using NUnit.Framework.Constraints;
using SeedAlias;
using SeedAlias.Core;

namespace NUnit.Framework;

/// <summary>
/// Extensions for EqualConstraint to handle AdditionalProperties values.
/// </summary>
public static class AdditionalPropertiesComparerExtensions
{
    /// <summary>
    /// Modifies the EqualConstraint to handle AdditionalProperties instances by comparing their
    /// serialized JSON representations. This handles the type mismatch between native C# types
    /// and JsonElement values that occur when comparing manually constructed objects with
    /// deserialized objects.
    /// </summary>
    /// <param name="constraint">The EqualConstraint to modify.</param>
    /// <returns>The same constraint instance for method chaining.</returns>
    public static EqualConstraint UsingAdditionalPropertiesComparer(this EqualConstraint constraint)
    {
        constraint.Using<AdditionalProperties>(
            (x, y) =>
            {
                if (x.Count != y.Count)
                {
                    return false;
                }

                foreach (var key in x.Keys)
                {
                    if (!y.ContainsKey(key))
                    {
                        return false;
                    }

                    var xElement = JsonUtils.SerializeToElement(x[key]);
                    var yElement = JsonUtils.SerializeToElement(y[key]);

                    if (!JsonElementsAreEqual(xElement, yElement))
                    {
                        return false;
                    }
                }

                return true;
            }
        );

        return constraint;
    }

    /// <summary>
    /// Modifies the EqualConstraint to handle Dictionary&lt;string, object?&gt; values by comparing
    /// their serialized JSON representations. This handles the type mismatch between native C# types
    /// and JsonElement values that occur when comparing manually constructed objects with
    /// deserialized objects.
    /// </summary>
    /// <param name="constraint">The EqualConstraint to modify.</param>
    /// <returns>The same constraint instance for method chaining.</returns>
    public static EqualConstraint UsingObjectDictionaryComparer(this EqualConstraint constraint)
    {
        constraint.Using<Dictionary<string, object?>>(
            (x, y) =>
            {
                if (x.Count != y.Count)
                {
                    return false;
                }

                foreach (var key in x.Keys)
                {
                    if (!y.ContainsKey(key))
                    {
                        return false;
                    }

                    var xElement = JsonUtils.SerializeToElement(x[key]);
                    var yElement = JsonUtils.SerializeToElement(y[key]);

                    if (!JsonElementsAreEqual(xElement, yElement))
                    {
                        return false;
                    }
                }

                return true;
            }
        );

        return constraint;
    }

    internal static bool JsonElementsAreEqualPublic(JsonElement x, JsonElement y) =>
        JsonElementsAreEqual(x, y);

    private static bool JsonElementsAreEqual(JsonElement x, JsonElement y)
    {
        if (x.ValueKind != y.ValueKind)
        {
            return false;
        }

        return x.ValueKind switch
        {
            JsonValueKind.Object => CompareJsonObjects(x, y),
            JsonValueKind.Array => CompareJsonArrays(x, y),
            JsonValueKind.String => x.GetString() == y.GetString(),
            JsonValueKind.Number => x.GetDecimal() == y.GetDecimal(),
            JsonValueKind.True => true,
            JsonValueKind.False => true,
            JsonValueKind.Null => true,
            _ => false,
        };
    }

    private static bool CompareJsonObjects(JsonElement x, JsonElement y)
    {
        var xProps = new Dictionary<string, JsonElement>();
        var yProps = new Dictionary<string, JsonElement>();

        foreach (var prop in x.EnumerateObject())
            xProps[prop.Name] = prop.Value;

        foreach (var prop in y.EnumerateObject())
            yProps[prop.Name] = prop.Value;

        if (xProps.Count != yProps.Count)
        {
            return false;
        }

        foreach (var key in xProps.Keys)
        {
            if (!yProps.ContainsKey(key))
            {
                return false;
            }

            if (!JsonElementsAreEqual(xProps[key], yProps[key]))
            {
                return false;
            }
        }

        return true;
    }

    private static bool CompareJsonArrays(JsonElement x, JsonElement y)
    {
        var xArray = x.EnumerateArray().ToList();
        var yArray = y.EnumerateArray().ToList();

        if (xArray.Count != yArray.Count)
        {
            return false;
        }

        for (var i = 0; i < xArray.Count; i++)
        {
            if (!JsonElementsAreEqual(xArray[i], yArray[i]))
            {
                return false;
            }
        }

        return true;
    }

    /// <summary>
    /// Modifies the EqualConstraint to handle cross-type comparisons involving JsonElement.
    /// When UsingPropertiesComparer() walks object properties and encounters a property typed as
    /// 'object', the expected side may be a Dictionary&lt;object, object?&gt; while the actual
    /// (deserialized) side is a JsonElement. This comparer bridges that gap by serializing both
    /// sides to JsonElement and comparing their JSON representations.
    /// </summary>
    /// <param name="constraint">The EqualConstraint to modify.</param>
    /// <returns>The same constraint instance for method chaining.</returns>
    public static EqualConstraint UsingJsonSerializationComparer(this EqualConstraint constraint)
    {
        return constraint.Using(new JsonSerializationFallbackComparer());
    }
}

/// <summary>
/// A non-generic IComparer that handles cross-type comparisons by serializing both sides
/// to JsonElement. This is needed because NUnit 4.4+ correctly treats "types not supported"
/// as a comparison failure in UsingPropertiesComparer(), which means properties typed as
/// 'object' that deserialize to JsonElement can no longer be compared with Dictionary instances
/// using the default typed comparers.
/// </summary>
public class JsonSerializationFallbackComparer : IComparer
{
    public int Compare(object? x, object? y)
    {
        if (x is null && y is null)
            return 0;
        if (x is null || y is null)
            return -1;

        // Only intervene for cross-type comparisons
        if (x.GetType() == y.GetType())
            return Comparer.Default.Compare(x, y);

        // At least one side should be a JsonElement for us to handle this
        if (x is not JsonElement && y is not JsonElement)
            return Comparer.Default.Compare(x, y);

        try
        {
            var xElement = x is JsonElement xje ? xje : JsonUtils.SerializeToElement(x);
            var yElement = y is JsonElement yje ? yje : JsonUtils.SerializeToElement(y);
            return AdditionalPropertiesComparerExtensions.JsonElementsAreEqualPublic(
                xElement,
                yElement
            )
                ? 0
                : -1;
        }
        catch
        {
            return -1;
        }
    }
}
