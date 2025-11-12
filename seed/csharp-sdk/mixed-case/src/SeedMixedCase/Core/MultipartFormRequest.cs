using System.Net.Http;
using System.Net.Http.Headers;

namespace SeedMixedCase.Core;

/// <summary>
/// The request object to be sent for multipart form data.
/// </summary>
internal record MultipartFormRequest : BaseRequest
{
    private readonly List<Action<MultipartFormDataContent>> _partAdders = [];

    internal void AddJsonPart(string name, object? value) => AddJsonPart(name, value, null);

    internal void AddJsonPart(string name, object? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        _partAdders.Add(form =>
        {
            var (encoding, charset, mediaType) = ParseContentTypeOrDefault(
                contentType,
                Utf8NoBom,
                "application/json"
            );
            var content = new StringContent(JsonUtils.Serialize(value), encoding, mediaType);
            if (string.IsNullOrEmpty(charset) && content.Headers.ContentType is not null)
            {
                content.Headers.ContentType.CharSet = "";
            }

            form.Add(content, name);
        });
    }

    internal void AddJsonParts(string name, IEnumerable<object?>? value) =>
        AddJsonParts(name, value, null);

    internal void AddJsonParts(string name, IEnumerable<object?>? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        foreach (var item in value)
        {
            AddJsonPart(name, item, contentType);
        }
    }

    internal void AddJsonParts<T>(string name, IEnumerable<T>? value) =>
        AddJsonParts(name, value, null);

    internal void AddJsonParts<T>(string name, IEnumerable<T>? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        foreach (var item in value)
        {
            AddJsonPart(name, item, contentType);
        }
    }

    internal void AddStringPart(string name, object? value) => AddStringPart(name, value, null);

    internal void AddStringPart(string name, object? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        AddStringPart(name, ValueConvert.ToString(value), contentType);
    }

    internal void AddStringPart(string name, string? value) => AddStringPart(name, value, null);

    internal void AddStringPart(string name, string? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        _partAdders.Add(form =>
        {
            var (encoding, charset, mediaType) = ParseContentTypeOrDefault(
                contentType,
                Utf8NoBom,
                "text/plain"
            );
            var content = new StringContent(value, encoding, mediaType);
            if (string.IsNullOrEmpty(charset) && content.Headers.ContentType is not null)
            {
                content.Headers.ContentType.CharSet = "";
            }

            form.Add(content, name);
        });
    }

    internal void AddStringParts(string name, IEnumerable<object?>? value) =>
        AddStringParts(name, value, null);

    internal void AddStringParts(string name, IEnumerable<object?>? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        AddStringPart(name, ValueConvert.ToString(value), contentType);
    }

    internal void AddStringParts(string name, IEnumerable<string?>? value) =>
        AddStringParts(name, value, null);

    internal void AddStringParts(string name, IEnumerable<string?>? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        foreach (var item in value)
        {
            AddStringPart(name, item, contentType);
        }
    }

    internal void AddStreamPart(string name, Stream? stream, string? fileName) =>
        AddStreamPart(name, stream, fileName, null);

    internal void AddStreamPart(string name, Stream? stream, string? fileName, string? contentType)
    {
        if (stream is null)
        {
            return;
        }

        _partAdders.Add(form =>
        {
            var content = new StreamContent(stream)
            {
                Headers =
                {
                    ContentType = MediaTypeHeaderValue.Parse(
                        contentType ?? "application/octet-stream"
                    ),
                },
            };

            if (fileName is not null)
            {
                form.Add(content, name, fileName);
            }
            else
            {
                form.Add(content, name);
            }
        });
    }

    internal void AddFileParameterPart(string name, Stream? stream) =>
        AddStreamPart(name, stream, null, null);

    internal void AddFileParameterPart(string name, FileParameter? file) =>
        AddFileParameterPart(name, file, null);

    internal void AddFileParameterPart(
        string name,
        FileParameter? file,
        string? fallbackContentType
    ) =>
        AddStreamPart(name, file?.Stream, file?.FileName, file?.ContentType ?? fallbackContentType);

    internal void AddFileParameterParts(string name, IEnumerable<FileParameter?>? files) =>
        AddFileParameterParts(name, files, null);

    internal void AddFileParameterParts(
        string name,
        IEnumerable<FileParameter?>? files,
        string? fallbackContentType
    )
    {
        if (files is null)
        {
            return;
        }

        foreach (var file in files)
        {
            AddFileParameterPart(name, file, fallbackContentType);
        }
    }

    internal void AddFormEncodedPart(string name, object? value) =>
        AddFormEncodedPart(name, value, null);

    internal void AddFormEncodedPart(string name, object? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        _partAdders.Add(form =>
        {
            var content = FormUrlEncoder.EncodeAsForm(value);
            if (!string.IsNullOrEmpty(contentType))
            {
                content.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);
            }

            form.Add(content, name);
        });
    }

    internal void AddFormEncodedParts(string name, IEnumerable<object?>? value) =>
        AddFormEncodedParts(name, value, null);

    internal void AddFormEncodedParts(string name, IEnumerable<object?>? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        foreach (var item in value)
        {
            AddFormEncodedPart(name, item, contentType);
        }
    }

    internal void AddExplodedFormEncodedPart(string name, object? value) =>
        AddExplodedFormEncodedPart(name, value, null);

    internal void AddExplodedFormEncodedPart(string name, object? value, string? contentType)
    {
        if (value is null)
        {
            return;
        }

        _partAdders.Add(form =>
        {
            var content = FormUrlEncoder.EncodeAsExplodedForm(value);
            if (!string.IsNullOrEmpty(contentType))
            {
                content.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);
            }

            form.Add(content, name);
        });
    }

    internal void AddExplodedFormEncodedParts(string name, IEnumerable<object?>? value) =>
        AddExplodedFormEncodedParts(name, value, null);

    internal void AddExplodedFormEncodedParts(
        string name,
        IEnumerable<object?>? value,
        string? contentType
    )
    {
        if (value is null)
        {
            return;
        }

        foreach (var item in value)
        {
            AddExplodedFormEncodedPart(name, item, contentType);
        }
    }

    internal override HttpContent CreateContent()
    {
        var form = new MultipartFormDataContent();
        foreach (var adder in _partAdders)
        {
            adder(form);
        }

        return form;
    }
}
