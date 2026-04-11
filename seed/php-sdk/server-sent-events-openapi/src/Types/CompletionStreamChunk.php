<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * A single chunk in a streamed completion response.
 */
class CompletionStreamChunk extends JsonSerializableType
{
    /**
     * @var ?string $delta The incremental text chunk.
     */
    #[JsonProperty('delta')]
    public ?string $delta;

    /**
     * @var ?int $tokens Number of tokens in this chunk.
     */
    #[JsonProperty('tokens')]
    public ?int $tokens;

    /**
     * @param array{
     *   delta?: ?string,
     *   tokens?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->delta = $values['delta'] ?? null;
        $this->tokens = $values['tokens'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
