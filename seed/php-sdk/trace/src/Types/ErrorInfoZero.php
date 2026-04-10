<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\CompileError;
use Seed\Core\Json\JsonProperty;

class ErrorInfoZero extends JsonSerializableType
{
    use CompileError;

    /**
     * @var value-of<ErrorInfoZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   message: string,
     *   type: value-of<ErrorInfoZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->message = $values['message'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
