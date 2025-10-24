using global::System.Net.Http;
using global::System.Text;
using global::System.Text.Json.Serialization;
using NUnit.Framework;
using SeedInferredAuthExplicit.Core;
using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedInferredAuthExplicit.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MultipartFormTests
{
    private static SimpleObject _simpleObject = new();

    private static string _simpleFormEncoded =
        "meta=data&Date=2023-10-01&Time=12:00:00&Duration=01:00:00&Id=1a1bb98f-47c6-407b-9481-78476affe52a&IsActive=true&Count=42&Initial=A&Values=data,2023-10-01,12:00:00,01:00:00,1a1bb98f-47c6-407b-9481-78476affe52a,true,42,A";

    private static string _simpleExplodedFormEncoded =
        "meta=data&Date=2023-10-01&Time=12:00:00&Duration=01:00:00&Id=1a1bb98f-47c6-407b-9481-78476affe52a&IsActive=true&Count=42&Initial=A&Values=data&Values=2023-10-01&Values=12:00:00&Values=01:00:00&Values=1a1bb98f-47c6-407b-9481-78476affe52a&Values=true&Values=42&Values=A";

    private static ComplexObject _complexObject = new();

    private static string _complexJson = """
        {
          "meta": "data",
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
          "Date": "2023-10-01",
          "Time": "12:00:00",
          "Duration": "01:00:00",
          "Id": "1a1bb98f-47c6-407b-9481-78476affe52a",
          "IsActive": true,
          "Count": 42,
          "Initial": "A"
        }
        """;

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
            Content-Type: text/plain
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
            Content-Type: text/plain
            Content-Disposition: form-data; name=strings

            {partInput}
            --{boundary}
            Content-Type: text/plain
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
            Content-Type: text/plain
            Content-Disposition: form-data; name=strings

            {partInput}
            --{boundary}
            Content-Type: text/plain
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
            Content-Type: text/xml
            Content-Disposition: form-data; name=string

            {partInput}
             --{boundary}--
            """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddStringPart_WithContentTypeAndCharset()
    {
        const string partInput = "<XML>string content</XML>";
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringPart("string", partInput, "text/xml; charset=utf-8");
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
            Content-Type: text/xml
            Content-Disposition: form-data; name=strings

            {partInput}
            --{boundary}
            Content-Type: text/xml
            Content-Disposition: form-data; name=strings

            {partInput}
             --{boundary}--
            """;
        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddStringParts_WithContentTypeAndCharset()
    {
        const string partInput = "<XML>string content</XML>";
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddStringParts(
            "strings",
            [partInput, partInput],
            "text/xml; charset=utf-8"
        );
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
        var file = new FileParameter { Stream = partInput, FileName = "test.txt" };
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
            ContentType = "text/plain",
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
    public async SystemTask ShouldAddFileParameter_WithContentTypeAndCharset()
    {
        var (partInput, partExpectedString) = GetFileParameterTestData();
        var file = new FileParameter
        {
            Stream = partInput,
            FileName = "test.txt",
            ContentType = "text/plain; charset=utf-8",
        };
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterPart("file", file, "ignored-fallback-content-type");

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: text/plain; charset=utf-8
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
    public async SystemTask ShouldAddFileParameter_WithFallbackContentTypeAndCharset()
    {
        var (partInput, partExpectedString) = GetFileParameterTestData();
        var file = new FileParameter { Stream = partInput, FileName = "test.txt" };
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFileParameterPart("file", file, "text/plain; charset=utf-8");

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: text/plain; charset=utf-8
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
    public async SystemTask ShouldAddFileParameter_FromFileInfo()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            const string fileContent = "test file content";
            await File.WriteAllTextAsync(tempFile, fileContent);
            var newFileName = Path.ChangeExtension(tempFile, ".txt");
            File.Move(tempFile, newFileName);
            tempFile = newFileName;

            var fileInfo = new System.IO.FileInfo(tempFile);
            FileParameter file = fileInfo;

            Assert.That(file.FileName, Is.EqualTo(Path.GetFileName(tempFile)));
            Assert.That(file.ContentType, Is.EqualTo("text/plain"));
            Assert.That(file.Stream, Is.Not.Null);

            var multipartFormRequest = CreateMultipartFormRequest();
            multipartFormRequest.AddFileParameterPart("file", file);

            var httpContent = multipartFormRequest.CreateContent();
            Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
            var multipartContent = (MultipartFormDataContent)httpContent;

            var boundary = GetBoundary(multipartContent);
            var expected = $"""
                --{boundary}
                Content-Type: text/plain
                Content-Disposition: form-data; name=file; filename={Path.GetFileName(
                    tempFile
                )}; filename*=utf-8''{Path.GetFileName(tempFile)}

                {fileContent}
                 --{boundary}--
                """;

            var actual = await multipartContent.ReadAsStringAsync();
            Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);

            file.Dispose();
        }
        finally
        {
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }

    [Test]
    public async SystemTask ShouldAddFileParameter_FromFileInfo_WithJsonExtension()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            const string fileContent = "{\"key\":\"value\"}";
            await File.WriteAllTextAsync(tempFile, fileContent);
            var newFileName = Path.ChangeExtension(tempFile, ".json");
            File.Move(tempFile, newFileName);
            tempFile = newFileName;

            var fileInfo = new System.IO.FileInfo(tempFile);
            FileParameter file = fileInfo;

            Assert.That(file.FileName, Is.EqualTo(Path.GetFileName(tempFile)));
            Assert.That(file.ContentType, Is.EqualTo("application/json"));
            Assert.That(file.Stream, Is.Not.Null);

            file.Dispose();
        }
        finally
        {
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }

    [Test]
    public async SystemTask ShouldAddFileParameter_FromFileInfo_WithPdfExtension()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            const string fileContent = "PDF content";
            await File.WriteAllTextAsync(tempFile, fileContent);
            var newFileName = Path.ChangeExtension(tempFile, ".pdf");
            File.Move(tempFile, newFileName);
            tempFile = newFileName;

            var fileInfo = new System.IO.FileInfo(tempFile);
            FileParameter file = fileInfo;

            Assert.That(file.FileName, Is.EqualTo(Path.GetFileName(tempFile)));
            Assert.That(file.ContentType, Is.EqualTo("application/pdf"));
            Assert.That(file.Stream, Is.Not.Null);

            file.Dispose();
        }
        finally
        {
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }

    [Test]
    public async SystemTask ShouldAddFileParameter_FromFileInfo_WithUnknownExtension()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            const string fileContent = "unknown content";
            await File.WriteAllTextAsync(tempFile, fileContent);
            var newFileName = Path.ChangeExtension(tempFile, ".xyz");
            File.Move(tempFile, newFileName);
            tempFile = newFileName;

            var fileInfo = new System.IO.FileInfo(tempFile);
            FileParameter file = fileInfo;

            Assert.That(file.FileName, Is.EqualTo(Path.GetFileName(tempFile)));
            Assert.That(file.ContentType, Is.EqualTo("application/octet-stream"));
            Assert.That(file.Stream, Is.Not.Null);

            file.Dispose();
        }
        finally
        {
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }

    [Test]
    public async SystemTask ShouldAddFileParameter_FromFileInfo_WithNoExtension()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            const string fileContent = "no extension content";
            await File.WriteAllTextAsync(tempFile, fileContent);

            var fileInfo = new System.IO.FileInfo(tempFile);
            FileParameter file = fileInfo;

            Assert.That(file.FileName, Is.EqualTo(Path.GetFileName(tempFile)));
            Assert.That(file.ContentType, Is.EqualTo("application/octet-stream"));
            Assert.That(file.Stream, Is.Not.Null);

            file.Dispose();
        }
        finally
        {
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }

    [Test]
    public void ShouldThrowArgumentNullException_WhenFileInfoIsNull()
    {
        System.IO.FileInfo? nullFileInfo = null;
        Assert.Throws<ArgumentNullException>(() =>
        {
            FileParameter file = nullFileInfo!;
        });
    }

    [Test]
    public async SystemTask ShouldAddJsonPart_WithComplexObject()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonPart("object", _complexObject);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/json
            Content-Disposition: form-data; name=object

            {_complexJson}
             --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddJsonPart_WithComplexObjectList()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonParts("objects", [_complexObject, _complexObject]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/json
            Content-Disposition: form-data; name=objects

            {_complexJson}
            --{boundary}
            Content-Type: application/json
            Content-Disposition: form-data; name=objects

            {_complexJson}
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
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddJsonParts("objects", [_complexObject, null]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/json
            Content-Disposition: form-data; name=objects

            {_complexJson}
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
            Content-Type: application/json-patch+json
            Content-Disposition: form-data; name=objects

            {}
            --{{boundary}}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedParts_WithSimpleObject()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedPart("object", _simpleObject);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=object

            {EscapeFormEncodedString(_simpleFormEncoded)}
             --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedParts_WithSimpleObjectList()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedParts("objects", [_simpleObject, _simpleObject]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            {EscapeFormEncodedString(_simpleFormEncoded)}
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            {EscapeFormEncodedString(_simpleFormEncoded)}
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
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedParts("objects", [_simpleObject, null]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            {EscapeFormEncodedString(_simpleFormEncoded)}
            --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedPart_WithContentType()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedPart(
            "objects",
            new { foo = "bar" },
            "application/x-www-form-urlencoded"
        );

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            foo=bar
            --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedPart_WithContentTypeAndCharset()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedPart(
            "objects",
            new { foo = "bar" },
            "application/x-www-form-urlencoded; charset=utf-8"
        );

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
        multipartFormRequest.AddFormEncodedParts(
            "objects",
            [new { foo = "bar" }],
            "application/x-www-form-urlencoded"
        );

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            foo=bar
            --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddFormEncodedParts_WithContentTypeAndCharset()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddFormEncodedParts(
            "objects",
            [new { foo = "bar" }],
            "application/x-www-form-urlencoded; charset=utf-8"
        );

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
    public async SystemTask ShouldAddExplodedFormEncodedParts_WithSimpleObject()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedPart("object", _simpleObject);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=object

            {EscapeFormEncodedString(_simpleExplodedFormEncoded)}
             --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddExplodedFormEncodedParts_WithSimpleObjectList()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedParts("objects", [_simpleObject, _simpleObject]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            {EscapeFormEncodedString(_simpleExplodedFormEncoded)}
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            {EscapeFormEncodedString(_simpleExplodedFormEncoded)}
             --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldNotAddExplodedFormEncodedParts_WithNull()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedPart("object", null);

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
    public async SystemTask ShouldNotAddExplodedFormEncodedParts_WithNullsInList()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedParts("objects", [_simpleObject, null]);

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            {EscapeFormEncodedString(_simpleExplodedFormEncoded)}
            --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddExplodedFormEncodedPart_WithContentType()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedPart(
            "objects",
            new { foo = "bar" },
            "application/x-www-form-urlencoded"
        );

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            foo=bar
            --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddExplodedFormEncodedPart_WithContentTypeAndCharset()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedPart(
            "objects",
            new { foo = "bar" },
            "application/x-www-form-urlencoded; charset=utf-8"
        );

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
    public async SystemTask ShouldAddExplodedFormEncodedParts_WithContentType()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedParts(
            "objects",
            [new { foo = "bar" }],
            "application/x-www-form-urlencoded"
        );

        var httpContent = multipartFormRequest.CreateContent();
        Assert.That(httpContent, Is.InstanceOf<MultipartFormDataContent>());
        var multipartContent = (MultipartFormDataContent)httpContent;

        var boundary = GetBoundary(multipartContent);
        var expected = $"""
            --{boundary}
            Content-Type: application/x-www-form-urlencoded
            Content-Disposition: form-data; name=objects

            foo=bar
            --{boundary}--
            """;

        var actual = await multipartContent.ReadAsStringAsync();
        Assert.That(actual, Is.EqualTo(expected).IgnoreWhiteSpace);
    }

    [Test]
    public async SystemTask ShouldAddExplodedFormEncodedParts_WithContentTypeAndCharset()
    {
        var multipartFormRequest = CreateMultipartFormRequest();
        multipartFormRequest.AddExplodedFormEncodedParts(
            "objects",
            [new { foo = "bar" }],
            "application/x-www-form-urlencoded; charset=utf-8"
        );

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
        return string.Join(
            "&",
            input
                .Split('&')
                .Select(x => x.Split('='))
                .Select(x => $"{Uri.EscapeDataString(x[0])}={Uri.EscapeDataString(x[1])}")
        );
    }

    private static string GetBoundary(MultipartFormDataContent content)
    {
        return content
                .Headers.ContentType?.Parameters.Single(p =>
                    p.Name.Equals("boundary", StringComparison.OrdinalIgnoreCase)
                )
                .Value?.Trim('"') ?? throw new global::System.Exception("Boundary not found");
    }

    private static MultipartFormRequest CreateMultipartFormRequest()
    {
        return new MultipartFormRequest
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

    private class SimpleObject
    {
        [JsonPropertyName("meta")]
        public string Meta { get; set; } = "data";
        public DateOnly Date { get; set; } = DateOnly.Parse("2023-10-01");
        public TimeOnly Time { get; set; } = TimeOnly.Parse("12:00:00");
        public TimeSpan Duration { get; set; } = TimeSpan.FromHours(1);
        public Guid Id { get; set; } = Guid.Parse("1a1bb98f-47c6-407b-9481-78476affe52a");
        public bool IsActive { get; set; } = true;
        public int Count { get; set; } = 42;
        public char Initial { get; set; } = 'A';
        public IEnumerable<object> Values { get; set; } =
        [
            "data",
            DateOnly.Parse("2023-10-01"),
            TimeOnly.Parse("12:00:00"),
            TimeSpan.FromHours(1),
            Guid.Parse("1a1bb98f-47c6-407b-9481-78476affe52a"),
            true,
            42,
            'A',
        ];
    }

    private class ComplexObject
    {
        [JsonPropertyName("meta")]
        public string Meta { get; set; } = "data";

        public object Nested { get; set; } = new { foo = "value" };

        public Dictionary<string, object> NestedDictionary { get; set; } =
            new() { { "key", new { foo = "value" } } };

        public IEnumerable<object> ListOfObjects { get; set; } =
            new List<object> { new { foo = "value" }, new { foo = "value2" } };

        public DateOnly Date { get; set; } = DateOnly.Parse("2023-10-01");
        public TimeOnly Time { get; set; } = TimeOnly.Parse("12:00:00");
        public TimeSpan Duration { get; set; } = TimeSpan.FromHours(1);
        public Guid Id { get; set; } = Guid.Parse("1a1bb98f-47c6-407b-9481-78476affe52a");
        public bool IsActive { get; set; } = true;
        public int Count { get; set; } = 42;
        public char Initial { get; set; } = 'A';
    }
}
