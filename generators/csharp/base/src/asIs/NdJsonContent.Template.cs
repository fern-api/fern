using global::System.Net;
using global::System.Net.Http;
using global::System.Net.Http.Headers;
using global::System.Text.Json;
using SystemTask = global::System.Threading.Tasks.Task;

namespace <%= namespace%>;

/// <summary>
/// Represents HTTP content encoded as newline-delimited JSON (NDJSON).
/// Always uses UTF-8 encoding as per JSON standard recommendations.
/// </summary>
internal class NdJsonContent : HttpContent, IIsRetryableContent
{
    private const string DefaultMediaType = "application/x-ndjson";
    private readonly object _content;
    private readonly JsonSerializerOptions _options;
    private static readonly byte[] NewLine = [(byte)'\n'];

    /// <summary>
    /// Initializes a new instance of the <see cref="NdJsonContent"/> class.
    /// </summary>
    /// <param name="content">The content to serialize as NDJSON. Must be an enumerable or enumerator of objects.</param>
    /// <param name="mediaType">The media type to use for the content. Defaults to "application/x-ndjson".</param>
    /// <param name="options">The JSON serializer options to use for serializing the content.</param>
    internal NdJsonContent(
        object content,
        string? mediaType = null,
        JsonSerializerOptions? options = null
    )
    {
        _content = content ?? throw new ArgumentNullException(nameof(content));

        // Create options with WriteIndented explicitly set to false
        if (options is not null)
        {
            _options = new JsonSerializerOptions(options) { WriteIndented = false };
        }
        else
        {
            _options = new JsonSerializerOptions { WriteIndented = false };
        }

        var contentTypeStr = mediaType ?? DefaultMediaType;
        Headers.ContentType =
            contentTypeStr == DefaultMediaType ? new MediaTypeHeaderValue(DefaultMediaType)
            : MediaTypeHeaderValue.TryParse(contentTypeStr, out var parsedMediaType)
                ? parsedMediaType
            : new MediaTypeHeaderValue(DefaultMediaType);
    }

    public bool IsRetryable => false;

    protected override bool TryComputeLength(out long length)
    {
        length = -1;
        return false;
    }

    protected override SystemTask SerializeToStreamAsync(Stream stream, TransportContext? context) =>
        SerializeToStreamAsyncInternal(stream, CancellationToken.None);

#if NET6_0_OR_GREATER
    protected override SystemTask SerializeToStreamAsync(
        Stream stream,
        TransportContext? context,
        CancellationToken cancellationToken
    ) => SerializeToStreamAsyncInternal(stream, cancellationToken);
#endif

    private async SystemTask SerializeToStreamAsyncInternal(
        Stream stream,
        CancellationToken cancellationToken
    )
    {
        switch (_content)
        {
            case IAsyncEnumerable<object> asyncEnumerable:
                await foreach (
                    var item in asyncEnumerable
                        .ConfigureAwait(false)
                        .WithCancellation(cancellationToken)
                )
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    await WriteJsonObjectToStream(stream, item, cancellationToken);
                }
                break;

            case IAsyncEnumerator<object> asyncEnumerator:
                while (await asyncEnumerator.MoveNextAsync().ConfigureAwait(false))
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    await WriteJsonObjectToStream(
                        stream,
                        asyncEnumerator.Current,
                        cancellationToken
                    );
                }
                break;
            case IEnumerable<object> enumerable:
                foreach (var item in enumerable)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    await WriteJsonObjectToStream(stream, item, cancellationToken);
                }
                break;

            case IEnumerator<object> enumerator:
                while (enumerator.MoveNext())
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    await WriteJsonObjectToStream(stream, enumerator.Current, cancellationToken);
                }
                break;

            default:
                throw new ArgumentException(
                    "Content must be an enumerable or enumerator of objects"
                );
        }
    }

    private async global::System.Threading.Tasks.Task WriteJsonObjectToStream(
        Stream stream,
        object item,
        CancellationToken cancellationToken
    )
    {
        await JsonSerializer.SerializeAsync(stream, item, _options, cancellationToken);
        await stream.WriteAsync(NewLine, 0, NewLine.Length, cancellationToken);
        await stream.FlushAsync(cancellationToken);
    }
}
