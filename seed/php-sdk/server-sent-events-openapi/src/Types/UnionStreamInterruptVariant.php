<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\UnionStreamRequestBase;

/**
 * Cancels the current operation. Inherits stream_response from base.
 */
class UnionStreamInterruptVariant extends JsonSerializableType
{
    use UnionStreamRequestBase;


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
