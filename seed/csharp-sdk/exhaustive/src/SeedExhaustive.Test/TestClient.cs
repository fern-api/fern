using System.Text.Json;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class TestClient
{
    [Test]
    public void test()
    {
        var dt = new ObjectWithOptionalField { Datetime = DateTime.Now };
        // var stringDt = JsonSerializer.Serialize(dt);
        var stringDt = JsonUtils.Serialize(dt);
    }
}