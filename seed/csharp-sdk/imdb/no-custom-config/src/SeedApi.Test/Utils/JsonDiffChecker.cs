namespace SeedApi.Test.Utils;

using System.Collections.Generic;
using Newtonsoft.Json.Linq;

using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

public static class JsonDiffChecker
{
    public static void AssertJsonEquals(string jsonString1, string jsonString2)
    {
        JToken token1 = JToken.Parse(jsonString1);
        JToken token2 = JToken.Parse(jsonString2);
        List<string> differences = GetJsonDifferences(token1, token2);

        Assert.IsEmpty(differences, $"The JSON strings are not equal: {string.Join(", ", differences)}");
    }

    private static List<string> GetJsonDifferences(JToken token1, JToken token2, string path = "")
    {
        List<string> differences = new List<string>();

        if (token1.Type != token2.Type)
        {
            differences.Add($"{path} has different types: {token1.Type} vs {token2.Type}");
            return differences;
        }

        if (token1 is JObject obj1 && token2 is JObject obj2)
        {
            foreach (var property in obj1.Properties())
            {
                string newPath = string.IsNullOrEmpty(path) ? property.Name : $"{path}.{property.Name}";
                if (!obj2.TryGetValue(property.Name, out JToken token2Value))
                {
                    differences.Add($"{newPath} is missing in the second JSON");
                }
                else
                {
                    differences.AddRange(GetJsonDifferences(property.Value, token2Value, newPath));
                }
            }

            foreach (var property in obj2.Properties())
            {
                string newPath = string.IsNullOrEmpty(path) ? property.Name : $"{path}.{property.Name}";
                if (!obj1.TryGetValue(property.Name, out JToken token1Value))
                {
                    differences.Add($"{newPath} is missing in the first JSON");
                }
            }
        }
        else if (token1 is JArray array1 && token2 is JArray array2)
        {
            for (int i = 0; i < Math.Max(array1.Count, array2.Count); i++)
            {
                string newPath = $"{path}[{i}]";
                if (i >= array1.Count)
                {
                    differences.Add($"{newPath} is missing in the first JSON");
                }
                else if (i >= array2.Count)
                {
                    differences.Add($"{newPath} is missing in the second JSON");
                }
                else
                {
                    differences.AddRange(GetJsonDifferences(array1[i], array2[i], newPath));
                }
            }
        }
        else if (!JToken.DeepEquals(token1, token2))
        {
            differences.Add($"{path} has different values: {token1} vs {token2}");
        }

        return differences;
    }
}