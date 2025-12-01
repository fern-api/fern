<?php

namespace Custom\Package\Path\Core\Multipart;

use GuzzleHttp\Psr7\Utils;
use Psr\Http\Message\StreamInterface;

class MultipartFormDataPart
{
    /**
     * @var string
     */
    private string $name;

    /**
     * @var StreamInterface
     */
    private StreamInterface $contents;

    /**
     * @var ?string
     */
    private ?string $filename;

    /**
     * @var ?array<string, string>
     */
    private ?array $headers;

    /**
     * @param string $name
     * @param string|bool|float|int|StreamInterface $value
     * @param ?string $filename
     * @param ?array<string, string> $headers
     */
    public function __construct(
        string $name,
        string|bool|float|int|StreamInterface $value,
        ?string $filename = null,
        ?array $headers = null
    ) {
        $this->name = $name;
        $this->contents = Utils::streamFor($value);
        $this->filename = $filename;
        $this->headers = $headers;
    }

    /**
     * Converts the multipart form data part into an array suitable
     * for Guzzle's multipart form data.
     *
     * @return array{
     *     name: string,
     *     contents: StreamInterface,
     *     filename?: string,
     *     headers?: array<string, string>
     * }
     */
    public function toArray(): array
    {
        $formData = [
            'name' => $this->name,
            'contents' => $this->contents,
        ];

        if ($this->filename != null) {
            $formData['filename'] = $this->filename;
        }

        if ($this->headers != null) {
            $formData['headers'] = $this->headers;
        }

        return $formData;
    }
}