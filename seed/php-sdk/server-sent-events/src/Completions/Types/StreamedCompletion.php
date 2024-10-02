<?php

namespace Seed\Completions\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class StreamedCompletion extends SerializableType
{
    /**
     * @var string $delta
     */
    #[JsonProperty('delta')]
    public string $delta;

    /**
     * @var ?int $tokens
     */
    #[JsonProperty('tokens')]
    public ?int $tokens;

    /**
     * @param array{
     *   delta: string,
     *   tokens?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->delta = $values['delta'];
        $this->tokens = $values['tokens'] ?? null;
    }
}
