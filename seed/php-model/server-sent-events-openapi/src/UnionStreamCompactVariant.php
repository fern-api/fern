<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\UnionStreamRequestBase;
use Seed\Core\Json\JsonProperty;

/**
 * Requests compaction of history. Inherits stream_response from base and adds compact-specific fields.
 */
class UnionStreamCompactVariant extends JsonSerializableType
{
    use UnionStreamRequestBase;

    /**
     * @var string $data Compact data payload.
     */
    #[JsonProperty('data')]
    public string $data;

    /**
     * @param array{
     *   prompt: string,
     *   data: string,
     *   streamResponse?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->streamResponse = $values['streamResponse'] ?? null;
        $this->prompt = $values['prompt'];
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
