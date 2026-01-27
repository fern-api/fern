using NUnit.Framework;
using SeedHeaderTokenEnvironmentVariable.Core;

namespace SeedHeaderTokenEnvironmentVariable.Test.Core;

[TestFixture]
public class HeadersBuilderTests
{
    [Test]
    public async global::System.Threading.Tasks.Task Add_SimpleHeaders()
    {
        var headers = await new HeadersBuilder.Builder()
            .Add("Content-Type", "application/json")
            .Add("Authorization", "Bearer token123")
            .Add("X-API-Key", "key456")
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(3));
        Assert.That(headers["Content-Type"], Is.EqualTo("application/json"));
        Assert.That(headers["Authorization"], Is.EqualTo("Bearer token123"));
        Assert.That(headers["X-API-Key"], Is.EqualTo("key456"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_NullValuesIgnored()
    {
        var headers = await new HeadersBuilder.Builder()
            .Add("Header1", "value1")
            .Add("Header2", null)
            .Add("Header3", "value3")
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(2));
        Assert.That(headers.ContainsKey("Header1"), Is.True);
        Assert.That(headers.ContainsKey("Header2"), Is.False);
        Assert.That(headers.ContainsKey("Header3"), Is.True);
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_OverwritesExistingHeader()
    {
        var headers = await new HeadersBuilder.Builder()
            .Add("Content-Type", "application/json")
            .Add("Content-Type", "application/xml")
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(1));
        Assert.That(headers["Content-Type"], Is.EqualTo("application/xml"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_HeadersOverload_MergesExistingHeaders()
    {
        var existingHeaders = new Headers(
            new Dictionary<string, string> { { "Header1", "value1" }, { "Header2", "value2" } }
        );

        var result = await new HeadersBuilder.Builder()
            .Add("Header3", "value3")
            .Add(existingHeaders)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(result.Count, Is.EqualTo(3));
        Assert.That(result["Header1"], Is.EqualTo("value1"));
        Assert.That(result["Header2"], Is.EqualTo("value2"));
        Assert.That(result["Header3"], Is.EqualTo("value3"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_HeadersOverload_OverwritesExistingHeaders()
    {
        var existingHeaders = new Headers(
            new Dictionary<string, string> { { "Header1", "override" } }
        );

        var result = await new HeadersBuilder.Builder()
            .Add("Header1", "original")
            .Add("Header2", "keep")
            .Add(existingHeaders)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result["Header1"], Is.EqualTo("override"));
        Assert.That(result["Header2"], Is.EqualTo("keep"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_HeadersOverload_NullHeadersIgnored()
    {
        var result = await new HeadersBuilder.Builder()
            .Add("Header1", "value1")
            .Add((Headers?)null)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(result.Count, Is.EqualTo(1));
        Assert.That(result["Header1"], Is.EqualTo("value1"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_KeyValuePairOverload_AddsHeaders()
    {
        var additionalHeaders = new List<KeyValuePair<string, string?>>
        {
            new("Header1", "value1"),
            new("Header2", "value2"),
        };

        var headers = await new HeadersBuilder.Builder()
            .Add("Header3", "value3")
            .Add(additionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(3));
        Assert.That(headers["Header1"], Is.EqualTo("value1"));
        Assert.That(headers["Header2"], Is.EqualTo("value2"));
        Assert.That(headers["Header3"], Is.EqualTo("value3"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_KeyValuePairOverload_IgnoresNullValues()
    {
        var additionalHeaders = new List<KeyValuePair<string, string?>>
        {
            new("Header1", "value1"),
            new("Header2", null), // Should be ignored
        };

        var headers = await new HeadersBuilder.Builder()
            .Add(additionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(1));
        Assert.That(headers.ContainsKey("Header2"), Is.False);
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_DictionaryOverload_AddsHeaders()
    {
        var dict = new Dictionary<string, string>
        {
            { "Header1", "value1" },
            { "Header2", "value2" },
        };

        var headers = await new HeadersBuilder.Builder()
            .Add("Header3", "value3")
            .Add(dict)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(3));
        Assert.That(headers["Header1"], Is.EqualTo("value1"));
        Assert.That(headers["Header2"], Is.EqualTo("value2"));
        Assert.That(headers["Header3"], Is.EqualTo("value3"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task EmptyBuilder_ReturnsEmptyHeaders()
    {
        var headers = await new HeadersBuilder.Builder().BuildAsync().ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(0));
    }

    [Test]
    public async global::System.Threading.Tasks.Task OnlyNullValues_ReturnsEmptyHeaders()
    {
        var headers = await new HeadersBuilder.Builder()
            .Add("Header1", null)
            .Add("Header2", null)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(0));
    }

    [Test]
    public async global::System.Threading.Tasks.Task ComplexMergingScenario()
    {
        // Simulates real SDK usage: endpoint headers + client headers + request options
        var clientHeaders = new Headers(
            new Dictionary<string, string>
            {
                { "X-Client-Version", "1.0.0" },
                { "User-Agent", "MyClient/1.0" },
            }
        );

        var clientAdditionalHeaders = new List<KeyValuePair<string, string?>>
        {
            new("X-Custom-Header", "custom-value"),
        };

        var requestOptionsHeaders = new Headers(
            new Dictionary<string, string>
            {
                { "Authorization", "Bearer user-token" },
                { "User-Agent", "MyClient/2.0" }, // Override
            }
        );

        var requestAdditionalHeaders = new List<KeyValuePair<string, string?>>
        {
            new("X-Request-ID", "req-123"),
            new("X-Custom-Header", "overridden-value"), // Override
        };

        var headers = await new HeadersBuilder.Builder()
            .Add("Content-Type", "application/json") // Endpoint header
            .Add("X-Endpoint-ID", "endpoint-1")
            .Add(clientHeaders)
            .Add(clientAdditionalHeaders)
            .Add(requestOptionsHeaders)
            .Add(requestAdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);

        // Verify precedence
        Assert.That(headers["Content-Type"], Is.EqualTo("application/json"));
        Assert.That(headers["X-Endpoint-ID"], Is.EqualTo("endpoint-1"));
        Assert.That(headers["X-Client-Version"], Is.EqualTo("1.0.0"));
        Assert.That(headers["User-Agent"], Is.EqualTo("MyClient/2.0")); // Overridden
        Assert.That(headers["Authorization"], Is.EqualTo("Bearer user-token"));
        Assert.That(headers["X-Request-ID"], Is.EqualTo("req-123"));
        Assert.That(headers["X-Custom-Header"], Is.EqualTo("overridden-value")); // Overridden
    }

    [Test]
    public async global::System.Threading.Tasks.Task Builder_WithCapacity()
    {
        // Test that capacity constructor works without errors
        var headers = await new HeadersBuilder.Builder(capacity: 10)
            .Add("Header1", "value1")
            .Add("Header2", "value2")
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(2));
        Assert.That(headers["Header1"], Is.EqualTo("value1"));
        Assert.That(headers["Header2"], Is.EqualTo("value2"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task Add_HeadersOverload_ResolvesDynamicHeaderValues()
    {
        // Test that BuildAsync properly resolves HeaderValue instances
        var existingHeaders = new Headers();
        existingHeaders["DynamicHeader"] = new HeaderValue(
            (Func<global::System.Threading.Tasks.Task<string>>)(
                () => global::System.Threading.Tasks.Task.FromResult("dynamic-value")
            )
        );

        var result = await new HeadersBuilder.Builder()
            .Add("StaticHeader", "static-value")
            .Add(existingHeaders)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result["StaticHeader"], Is.EqualTo("static-value"));
        Assert.That(result["DynamicHeader"], Is.EqualTo("dynamic-value"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task MultipleSyncAdds()
    {
        var headers1 = new Headers(new Dictionary<string, string> { { "H1", "v1" } });
        var headers2 = new Headers(new Dictionary<string, string> { { "H2", "v2" } });
        var headers3 = new Headers(new Dictionary<string, string> { { "H3", "v3" } });

        var result = await new HeadersBuilder.Builder()
            .Add(headers1)
            .Add(headers2)
            .Add(headers3)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(result.Count, Is.EqualTo(3));
        Assert.That(result["H1"], Is.EqualTo("v1"));
        Assert.That(result["H2"], Is.EqualTo("v2"));
        Assert.That(result["H3"], Is.EqualTo("v3"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task PrecedenceOrder_LatestWins()
    {
        // Test that later operations override earlier ones
        var headers1 = new Headers(new Dictionary<string, string> { { "Key", "value1" } });
        var headers2 = new Headers(new Dictionary<string, string> { { "Key", "value2" } });
        var additional = new List<KeyValuePair<string, string?>> { new("Key", "value3") };

        var result = await new HeadersBuilder.Builder()
            .Add("Key", "value0")
            .Add(headers1)
            .Add(headers2)
            .Add(additional)
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(result["Key"], Is.EqualTo("value3"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task CaseInsensitiveKeys()
    {
        // Test that header keys are case-insensitive
        var headers = await new HeadersBuilder.Builder()
            .Add("content-type", "application/json")
            .Add("Content-Type", "application/xml") // Should overwrite
            .BuildAsync()
            .ConfigureAwait(false);

        Assert.That(headers.Count, Is.EqualTo(1));
        Assert.That(headers["content-type"], Is.EqualTo("application/xml"));
        Assert.That(headers["Content-Type"], Is.EqualTo("application/xml"));
        Assert.That(headers["CONTENT-TYPE"], Is.EqualTo("application/xml"));
    }
}
