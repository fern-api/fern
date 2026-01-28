using global::System.Text.Json;
using NUnit.Framework.Constraints;

namespace NUnit.Framework;

/// <summary>
/// Extensions for EqualConstraint to handle JsonElement objects.
/// </summary>
public static class JsonElementComparerExtensions
{
    /// <summary>
    /// Extension method for comparing JsonElement objects in NUnit tests.
    /// Property order doesn't matter, but array order does matter.
    /// Includes special handling for DateTime string formats.
    /// </summary>
    /// <param name="constraint">The Is.EqualTo() constraint instance.</param>
    /// <returns>A constraint that can compare JsonElements with detailed diffs.</returns>
    public static EqualConstraint UsingJsonElementComparer(this EqualConstraint constraint)
    {
        return constraint.Using(new JsonElementComparer());
    }
}

/// <summary>
/// Equality comparer for JsonElement with detailed reporting.
/// Property order doesn't matter, but array order does matter.
/// Now includes special handling for DateTime string formats with improved null handling.
/// </summary>
public class JsonElementComparer : IEqualityComparer<JsonElement>
{
    private string _failurePath = string.Empty;

    /// <inheritdoc />
    public bool Equals(JsonElement x, JsonElement y)
    {
        _failurePath = string.Empty;
        return CompareJsonElements(x, y, string.Empty);
    }

    /// <inheritdoc />
    public int GetHashCode(JsonElement obj)
    {
        return JsonSerializer.Serialize(obj).GetHashCode();
    }

    private bool CompareJsonElements(JsonElement x, JsonElement y, string path)
    {
        // If value kinds don't match, they're not equivalent
        if (x.ValueKind != y.ValueKind)
        {
            _failurePath = $"{path}: Expected {x.ValueKind} but got {y.ValueKind}";
            return false;
        }

        switch (x.ValueKind)
        {
            case JsonValueKind.Object:
                return CompareJsonObjects(x, y, path);

            case JsonValueKind.Array:
                return CompareJsonArraysInOrder(x, y, path);

            case JsonValueKind.String:
                string? xStr = x.GetString();
                string? yStr = y.GetString();

                // Handle null strings
                if (xStr is null && yStr is null)
                    return true;

                if (xStr is null || yStr is null)
                {
                    _failurePath =
                        $"{path}: Expected {(xStr is null ? "null" : $"\"{xStr}\"")} but got {(yStr is null ? "null" : $"\"{yStr}\"")}";
                    return false;
                }

                // Check if they are identical strings
                if (xStr == yStr)
                    return true;

                // Try to handle DateTime strings
                if (IsLikelyDateTimeString(xStr) && IsLikelyDateTimeString(yStr))
                {
                    if (AreEquivalentDateTimeStrings(xStr, yStr))
                        return true;
                }

                _failurePath = $"{path}: Expected \"{xStr}\" but got \"{yStr}\"";
                return false;

            case JsonValueKind.Number:
                if (x.GetDecimal() != y.GetDecimal())
                {
                    _failurePath = $"{path}: Expected {x.GetDecimal()} but got {y.GetDecimal()}";
                    return false;
                }

                return true;

            case JsonValueKind.True:
            case JsonValueKind.False:
                if (x.GetBoolean() != y.GetBoolean())
                {
                    _failurePath = $"{path}: Expected {x.GetBoolean()} but got {y.GetBoolean()}";
                    return false;
                }

                return true;

            case JsonValueKind.Null:
                return true;

            default:
                _failurePath = $"{path}: Unsupported JsonValueKind {x.ValueKind}";
                return false;
        }
    }

    private bool IsLikelyDateTimeString(string? str)
    {
        // Simple heuristic to identify likely ISO date time strings
        return str is not null
            && (str.Contains("T") && (str.EndsWith("Z") || str.Contains("+") || str.Contains("-")));
    }

    private bool AreEquivalentDateTimeStrings(string str1, string str2)
    {
        // Try to parse both as DateTime
        if (DateTime.TryParse(str1, out DateTime dt1) && DateTime.TryParse(str2, out DateTime dt2))
        {
            return dt1 == dt2;
        }

        return false;
    }

    private bool CompareJsonObjects(JsonElement x, JsonElement y, string path)
    {
        // Create dictionaries for both JSON objects
        var xProps = new Dictionary<string, JsonElement>();
        var yProps = new Dictionary<string, JsonElement>();

        foreach (var prop in x.EnumerateObject())
            xProps[prop.Name] = prop.Value;

        foreach (var prop in y.EnumerateObject())
            yProps[prop.Name] = prop.Value;

        // Check if all properties in x exist in y
        foreach (var key in xProps.Keys)
        {
            if (!yProps.ContainsKey(key))
            {
                _failurePath = $"{path}: Missing property '{key}'";
                return false;
            }
        }

        // Check if y has extra properties
        foreach (var key in yProps.Keys)
        {
            if (!xProps.ContainsKey(key))
            {
                _failurePath = $"{path}: Unexpected property '{key}'";
                return false;
            }
        }

        // Compare each property value
        foreach (var key in xProps.Keys)
        {
            var propPath = string.IsNullOrEmpty(path) ? key : $"{path}.{key}";
            if (!CompareJsonElements(xProps[key], yProps[key], propPath))
            {
                return false;
            }
        }

        return true;
    }

    private bool CompareJsonArraysInOrder(JsonElement x, JsonElement y, string path)
    {
        var xArray = x.EnumerateArray();
        var yArray = y.EnumerateArray();

        // Count x elements
        var xCount = 0;
        var xElements = new List<JsonElement>();
        foreach (var item in xArray)
        {
            xElements.Add(item);
            xCount++;
        }

        // Count y elements
        var yCount = 0;
        var yElements = new List<JsonElement>();
        foreach (var item in yArray)
        {
            yElements.Add(item);
            yCount++;
        }

        // Check if counts match
        if (xCount != yCount)
        {
            _failurePath = $"{path}: Expected {xCount} items but found {yCount}";
            return false;
        }

        // Compare elements in order
        for (var i = 0; i < xCount; i++)
        {
            var itemPath = $"{path}[{i}]";
            if (!CompareJsonElements(xElements[i], yElements[i], itemPath))
            {
                return false;
            }
        }

        return true;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        if (!string.IsNullOrEmpty(_failurePath))
        {
            return $"JSON comparison failed at {_failurePath}";
        }

        return "JsonElementEqualityComparer";
    }
}
