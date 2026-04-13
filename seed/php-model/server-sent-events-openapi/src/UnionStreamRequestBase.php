<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Base schema for union stream requests. Contains the stream_response field that is inherited by all oneOf variants via allOf. This schema is also referenced directly by a non-streaming endpoint to ensure it is not excluded from the context.
 */
class UnionStreamRequestBase extends JsonSerializableType
{
    /**
     * @var ?bool $streamResponse Whether to stream the response.
     */
    #[JsonProperty('stream_response')]
    public ?bool $streamResponse;

    /**
     * @var string $prompt The input prompt.
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @param array{
     *   prompt: string,
     *   streamResponse?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->streamResponse = $values['streamResponse'] ?? null;
        $this->prompt = $values['prompt'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
