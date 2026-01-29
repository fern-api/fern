using System.Text.Json;
using NUnit.Framework.Constraints;
using SeedQueryParameters;
using SeedQueryParameters.Core;

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
}
