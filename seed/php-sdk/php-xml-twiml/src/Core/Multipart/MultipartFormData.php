<?php

namespace Seed\Core\Multipart;

use Http\Message\MultipartStream\MultipartStreamBuilder;
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
    ): void {
        $headers = $contentType !== null ? ['Content-Type' => $contentType] : null;
        $this->addPart(
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
     * Adds all parts to a MultipartStreamBuilder.
     *
     * @param MultipartStreamBuilder $builder
     */
    public function addToBuilder(MultipartStreamBuilder $builder): void
    {
        foreach ($this->parts as $part) {
            $part->addToBuilder($builder);
        }
    }
}
