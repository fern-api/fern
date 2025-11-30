<?php

namespace Custom\Package\Path\Utils;

use Exception;
use GuzzleHttp\Psr7\Utils;
use Psr\Http\Message\StreamInterface;
use Custom\Package\Path\Core\Multipart\MultipartFormDataPart;

/**
 * File is a utility class used to transfer files as multipart form data.
 */
class File
{
    /** @var StreamInterface */
    private StreamInterface $stream;

    /** @var ?string */
    private ?string $filename;

    /** @var ?string */
    private ?string $contentType;

    /**
     * @param StreamInterface $stream
     * @param ?string $filename
     * @param ?string $contentType
     */
    public function __construct(
        StreamInterface $stream,
        ?string $filename = null,
        ?string $contentType = null,
    ) {
        $this->filename = $filename;
        $this->contentType = $contentType;
        $this->stream = $stream;
    }

    /**
     * Creates a File instance from a filepath.
     *
     * @param string $filepath
     * @param ?string $filename
     * @param ?string $contentType
     * @return File
     * @throws Exception
     */
    public static function createFromFilepath(
        string $filepath,
        ?string $filename = null,
        ?string $contentType = null,
    ): File {
        $resource = fopen($filepath, 'r');
        if (!$resource) {
            throw new Exception("Unable to open file $filepath");
        }
        $stream = Utils::streamFor($resource);
        if (!$stream->isReadable()) {
            throw new Exception("File $filepath is not readable");
        }
        return new self(
            stream: $stream,
            filename: $filename ?? basename($filepath),
            contentType: $contentType,
        );
    }

    /**
     * Creates a File instance from a string.
     *
     * @param string $content
     * @param ?string $filename
     * @param ?string $contentType
     * @return File
     */
    public static function createFromString(
        string $content,
        ?string $filename,
        ?string $contentType = null,
    ): File {
        return new self(
            stream: Utils::streamFor($content),
            filename: $filename,
            contentType: $contentType,
        );
    }

    /**
     * Maps this File into a multipart form data part.
     *
     * @param string $name The name of the multipart form data part.
     * @param ?string $contentType Overrides the Content-Type associated with the file, if any.
     * @return MultipartFormDataPart
     */
    public function toMultipartFormDataPart(string $name, ?string $contentType = null): MultipartFormDataPart
    {
        $contentType ??= $this->contentType;
        $headers = $contentType != null
            ? ['Content-Type' => $contentType]
            : null;

        return new MultipartFormDataPart(
            name: $name,
            value: $this->stream,
            filename: $this->filename,
            headers: $headers,
        );
    }

    /**
     * Closes the file stream.
     */
    public function close(): void
    {
        $this->stream->close();
    }

    /**
     * Destructor to ensure stream is closed.
     */
    public function __destruct()
    {
        $this->close();
    }
}