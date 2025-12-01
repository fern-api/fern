<?php

namespace Custom\Package\Path\Core\Multipart;

use Psr\Http\Message\StreamInterface;

class MultipartFormData
{
    /**
     * @var array<MultipartFormDataPart>
     */
    private array $parts = [];

    /**
     * Adds a new part to the multipart form data.
     *
     * @param string $name
     * @param string|int|bool|float|StreamInterface $value
     * @param ?string $contentType
     */
    public function add(
        string $name,
        string|int|bool|float|StreamInterface $value,
        ?string $contentType = null,
    ): void
    {
        $headers = $contentType != null ? ['Content-Type' => $contentType] : null;
        self::addPart(
            new MultipartFormDataPart(
                name: $name,
                value: $value,
                headers: $headers,
            )
        );
    }

    /**
     * Adds a new part to the multipart form data.
     *
     * @param MultipartFormDataPart $part
     */
    public function addPart(MultipartFormDataPart $part): void
    {
        $this->parts[] = $part;
    }

    /**
     * Converts the multipart form data into an array suitable
     * for Guzzle's multipart form data.
     *
     * @return array<array{
     *     name: string,
     *     contents: StreamInterface,
     *     filename?: string,
     *     headers?: array<string, string>
     * }>
     */
    public function toArray(): array
    {
        return array_map(fn($part) => $part->toArray(), $this->parts);
    }
}