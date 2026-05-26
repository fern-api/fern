<?php

namespace Seed\Core\Multipart;

use Http\Message\MultipartStream\MultipartStreamBuilder;
use Psr\Http\Message\StreamInterface;

class MultipartFormDataPart
{
    /**
     * @var string
     */
    private string $name;

    /**
     * @var StreamInterface|string
     */
    private StreamInterface|string $contents;

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
        $this->contents = $value instanceof StreamInterface ? $value : (string)$value;
        $this->filename = $filename;
        $this->headers = $headers;
    }

    /**
     * Adds this part to a MultipartStreamBuilder.
     *
     * @param MultipartStreamBuilder $builder
     */
    public function addToBuilder(MultipartStreamBuilder $builder): void
    {
        $options = array_filter([
            'filename' => $this->filename,
            'headers' => $this->headers,
        ], fn ($value) => $value !== null);

        $builder->addResource($this->name, $this->contents, $options);
    }
}
