<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\UnionStreamRequestBase;
use Seed\Core\Json\JsonProperty;

/**
 * A user input message. Inherits stream_response from base via allOf.
 */
class UnionStreamMessageVariant extends JsonSerializableType
{
    use UnionStreamRequestBase;

    /**
     * @var string $message The message content.
     */
    #[JsonProperty('message')]
    public string $message;

    /**
     * @param array{
     *   prompt: string,
     *   message: string,
     *   streamResponse?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->streamResponse = $values['streamResponse'] ?? null;
        $this->prompt = $values['prompt'];
        $this->message = $values['message'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
