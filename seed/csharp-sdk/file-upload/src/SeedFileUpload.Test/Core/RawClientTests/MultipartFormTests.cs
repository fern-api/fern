using System.Text;
using Newtonsoft.Json;
using NUnit.Framework;
using SeedFileUpload.Core;
using SystemTask = global::System.Threading.Tasks.Task;
using Newtonsoft.Json.Linq;

namespace SeedFileUpload.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.All)]
public class MultipartFormTests
{
    [Test]
    public async SystemTask ShouldAddStringPart()
    {
        const string partInput = "string content";
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringPart("string", partInput);
        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;
        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: text/plain; charset=utf-8
                        Content-Disposition: form-data; name=string

                        {partInput}
                         --{boundary}--
                        """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }
    
    [Test]
    public async SystemTask ShouldAddStringParts()
    {
        const string partInput = "string content";
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringParts("strings", [partInput, partInput]);
        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;
        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: text/plain; charset=utf-8
                        Content-Disposition: form-data; name=strings

                        {partInput}
                        --{boundary}
                        Content-Type: text/plain; charset=utf-8
                        Content-Disposition: form-data; name=strings
                        
                        {partInput}
                         --{boundary}--
                        """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }
    
    [Test]
    public async SystemTask GivenNull_ShouldNotAddStringPart()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringPart("string", null);
        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;
        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                         --{boundary}--
                        """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }
    
    [Test]
    public async SystemTask ShouldAddStringParts_WithNullsInList()
    {
        const string partInput = "string content";
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringParts("strings", [partInput, null, partInput]);
        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;
        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: text/plain; charset=utf-8
                        Content-Disposition: form-data; name=strings

                        {partInput}
                        --{boundary}
                        Content-Type: text/plain; charset=utf-8
                        Content-Disposition: form-data; name=strings
                        
                        {partInput}
                         --{boundary}--
                        """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }
    
    [Test]
    public async SystemTask ShouldAddStringPart_WithContentType()
    {
        const string partInput = "<XML>string content</XML>";
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringPart("string", partInput, "text/xml");
        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;
        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: text/xml; charset=utf-8
                        Content-Disposition: form-data; name=string
                        
                        {partInput}
                         --{boundary}--
                        """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }
    
    [Test]
    public async SystemTask ShouldAddStringParts_WithContentType()
    {
        const string partInput = "<XML>string content</XML>";
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringParts("strings", [partInput, partInput], "text/xml");
        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;
        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: text/xml; charset=utf-8
                        Content-Disposition: form-data; name=strings

                        {partInput}
                        --{boundary}
                        Content-Type: text/xml; charset=utf-8
                        Content-Disposition: form-data; name=strings

                        {partInput}
                         --{boundary}--
                        """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }
    
    [Test]
    public async SystemTask ShouldAddFileParameter_WithFileName()
    {
        var (partInput, partExpectedString) = GetFileParameterTestData();
        var file = new FileParameter
            { Stream = partInput, FileName = "test.txt" };
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterPart("file", file);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/octet-stream
                        Content-Disposition: form-data; name=file; filename=test.txt; filename*=utf-8''test.txt

                        {partExpectedString}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFileParameter_WithoutFileName()
    {
        var (partInput, partExpectedString) = GetFileParameterTestData();
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterPart("file", partInput);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/octet-stream
                        Content-Disposition: form-data; name=file

                        {partExpectedString}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFileParameter_WithContentType()
    {
        var (partInput, partExpectedString) = GetFileParameterTestData();
        var file = new FileParameter
        {
            Stream = partInput,
            FileName = "test.txt",
            ContentType = "text/plain"
        };
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterPart("file", file, "ignored-fallback-content-type");

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: text/plain
                        Content-Disposition: form-data; name=file; filename=test.txt; filename*=utf-8''test.txt

                        {partExpectedString}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFileParameter_WithFallbackContentType()
    {
        var (partInput, partExpectedString) = GetFileParameterTestData();
        var file = new FileParameter { Stream = partInput, FileName = "test.txt" };
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterPart("file", file, "text/plain");

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: text/plain
                        Content-Disposition: form-data; name=file; filename=test.txt; filename*=utf-8''test.txt

                        {partExpectedString}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFileParameters()
    {
        var (partInput1, partExpectedString1) = GetFileParameterTestData();
        var (partInput2, partExpectedString2) = GetFileParameterTestData();
        var file1 = new FileParameter { Stream = partInput1, FileName = "test1.txt" };
        var file2 = new FileParameter { Stream = partInput2, FileName = "test2.txt" };
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterParts("file", [file1, file2]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/octet-stream
                        Content-Disposition: form-data; name=file; filename=test1.txt; filename*=utf-8''test1.txt

                        {partExpectedString1}
                        --{boundary}
                        Content-Type: application/octet-stream
                        Content-Disposition: form-data; name=file; filename=test2.txt; filename*=utf-8''test2.txt

                        {partExpectedString2}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFileParameters_WithNullsInList()
    {
        var (partInput1, partExpectedString1) = GetFileParameterTestData();
        var (partInput2, partExpectedString2) = GetFileParameterTestData();
        var file1 = new FileParameter { Stream = partInput1, FileName = "test1.txt" };
        var file2 = new FileParameter { Stream = partInput2, FileName = "test2.txt" };
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterParts("file", [file1, null, file2]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/octet-stream
                        Content-Disposition: form-data; name=file; filename=test1.txt; filename*=utf-8''test1.txt

                        {partExpectedString1}
                        --{boundary}
                        Content-Type: application/octet-stream
                        Content-Disposition: form-data; name=file; filename=test2.txt; filename*=utf-8''test2.txt

                        {partExpectedString2}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask GivenNull_ShouldNotAddFileParameter()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterPart("file", null);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddJsonPart_WithComplexObject()
    {
        var (partInput, _, partExpectedJson) = GetObjectWithAttributesTestData();
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonPart("object", partInput);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/json; charset=utf-8
                        Content-Disposition: form-data; name=object

                        {partExpectedJson}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddJsonPart_WithComplexObjectList()
    {
        var (partInput, _, partExpectedJson) = GetObjectWithAttributesTestData();
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonParts("objects", [partInput, partInput]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/json; charset=utf-8
                        Content-Disposition: form-data; name=objects

                        {partExpectedJson}
                        --{boundary}
                        Content-Type: application/json; charset=utf-8
                        Content-Disposition: form-data; name=objects

                        {partExpectedJson}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask GivenNull_ShouldNotAddJsonPart()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonPart("object", null);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddJsonParts_WithNullsInList()
    {
        var (partInput, _, partExpectedJson) = GetObjectWithAttributesTestData();
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonParts("objects", [partInput, null]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/json; charset=utf-8
                        Content-Disposition: form-data; name=objects

                        {partExpectedJson}
                        --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddJsonParts_WithContentType()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonParts("objects", [new { }], "application/json-patch+json");

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $$"""
                         --{{boundary}}
                         Content-Type: application/json-patch+json; charset=utf-8
                         Content-Disposition: form-data; name=objects

                         {}
                         --{{boundary}}--
                         """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedParts_WithComplexObject()
    {
        var (partInput, partExpectedFromEncoded, _) = GetObjectWithAttributesTestData();
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedPart("object", partInput);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/x-www-form-urlencoded
                        Content-Disposition: form-data; name=object

                        {partExpectedFromEncoded}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedParts_WithComplexObjectList()
    {
        var (partInput, partExpectedFromEncoded, _) = GetObjectWithAttributesTestData();
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedParts("objects", [partInput, partInput]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/x-www-form-urlencoded
                        Content-Disposition: form-data; name=objects

                        {partExpectedFromEncoded}
                        --{boundary}
                        Content-Type: application/x-www-form-urlencoded
                        Content-Disposition: form-data; name=objects

                        {partExpectedFromEncoded}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldNotAddFormEncodedParts_WithNull()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedParts("object", null);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                         --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldNotAddFormEncodedParts_WithNullsInList()
    {
        var (partInput, partExpectedFromEncoded, _) = GetObjectWithAttributesTestData();
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedParts("objects", [partInput, null]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/x-www-form-urlencoded
                        Content-Disposition: form-data; name=objects

                        {partExpectedFromEncoded}
                        --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedPart_WithContentType()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedPart("objects", new { foo = "bar" },
            "application/x-www-form-urlencoded; charset=utf-8");

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/x-www-form-urlencoded; charset=utf-8
                        Content-Disposition: form-data; name=objects

                        foo=bar
                        --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedParts_WithContentType()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedParts("objects", [new { foo = "bar" }],
            "application/x-www-form-urlencoded; charset=utf-8");

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
                        --{boundary}
                        Content-Type: application/x-www-form-urlencoded; charset=utf-8
                        Content-Disposition: form-data; name=objects

                        foo=bar
                        --{boundary}--
                        """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    private static string EscapeFormEncodedString(string input)
    {
        return string.Join('&', input.Split("&")
            .Select(x => x.Split("="))
            .Select(x => $"{Uri.EscapeDataString(x[0])}={Uri.EscapeDataString(x[1])}")
        );
    }

    private static string GetBoundary(MultipartFormDataContent content)
    {
        return content.Headers.ContentType?.Parameters
            .Single(p => p.Name == "boundary").Value?.Trim('"') ?? throw new Exception("Boundary not found");
    }

    private static RawClient.MultipartFormRequest CreateMultipartFormRequest()
    {
        return new RawClient.MultipartFormRequest
        {
            BaseUrl = "https://localhost",
            Method = HttpMethod.Post,
            Path = "",
        };
    }

    private static (Stream partInput, string partExpectedString) GetFileParameterTestData()
    {
        const string partExpectedString = "file content";
        var partInput = new MemoryStream(Encoding.Default.GetBytes(partExpectedString));
        return (partInput, partExpectedString);
    }

    private static (ComplexObject partInput, string partExpectedFromEncoded, string partExpectedJson)
        GetObjectWithAttributesTestData()
    {
        var input = new ComplexObject();
        var partExpectedFromEncoded =
            "Meta=data&Nested[foo]=value&NestedDictionary[key][foo]=value&ListOfObjects[][foo]=value&ListOfObjects[][foo]=value2&DateTime=2023-10-01T08:00:00.000-04:00&Date=2023-10-01&Time=12:00:00&Duration=01:00:00&Id=1a1bb98f-47c6-407b-9481-78476affe52a&IsActive=true&Count=42&Price=19.99&Rating=4.5&Score=99.9&BigNumber=1234567890&SmallNumber=123&UnsignedShort=123&UnsignedInt=1234567890&UnsignedLong=12345678901234567890&Initial=A";
        partExpectedFromEncoded = EscapeFormEncodedString(partExpectedFromEncoded);
        const string partExpectedJson = """
                                        {
                                          "Meta": "data",
                                          "Nested": {
                                            "foo": "value"
                                          },
                                          "NestedDictionary": {
                                            "key": {
                                              "foo": "value"
                                            }
                                          },
                                          "ListOfObjects": [
                                            {
                                              "foo": "value"
                                            },
                                            {
                                              "foo": "value2"
                                            }
                                          ],
                                          "DateTime": "2023-10-01T08:00:00.000-04:00",
                                          "Date": "2023-10-01",
                                          "Time": "12:00:00",
                                          "Duration": "01:00:00",
                                          "Id": "1a1bb98f-47c6-407b-9481-78476affe52a",
                                          "IsActive": true,
                                          "Count": 42,
                                          "Price": 19.99,
                                          "Rating": 4.5,
                                          "Score": 99.9,
                                          "BigNumber": 1234567890,
                                          "SmallNumber": 123,
                                          "UnsignedShort": 123,
                                          "UnsignedInt": 1234567890,
                                          "UnsignedLong": 12345678901234567890,
                                          "Initial": "A"
                                        } 
                                        """;
        return (input, partExpectedFromEncoded, partExpectedJson);
    }

    private class ComplexObject
    {
        [JsonProperty("meta")] public string Meta { get; set; } = "data";
        public object Nested { get; set; } = new { foo = "value" };

        public Dictionary<string, object> NestedDictionary { get; set; } = new()
        {
            { "key", new { foo = "value" } }
        };

        public IEnumerable<object> ListOfObjects { get; set; } = new List<object>
        {
            new { foo = "value" },
            new { foo = "value2" }
        };

        public DateTime DateTime { get; set; } = DateTime.Parse("2023-10-01T12:00:00Z");
        public DateOnly Date { get; set; } = DateOnly.Parse("2023-10-01");
        public TimeOnly Time { get; set; } = TimeOnly.Parse("12:00:00");
        public TimeSpan Duration { get; set; } = TimeSpan.FromHours(1);
        public Guid Id { get; set; } = Guid.Parse("1a1bb98f-47c6-407b-9481-78476affe52a");
        public bool IsActive { get; set; } = true;
        public int Count { get; set; } = 42;
        public decimal Price { get; set; } = 19.99m;
        public float Rating { get; set; } = 4.5f;
        public double Score { get; set; } = 99.9;
        public long BigNumber { get; set; } = 1234567890;
        public short SmallNumber { get; set; } = 123;
        public ushort UnsignedShort { get; set; } = 123;
        public uint UnsignedInt { get; set; } = 1234567890;
        public ulong UnsignedLong { get; set; } = 12345678901234567890;
        public char Initial { get; set; } = 'A';
    }
}