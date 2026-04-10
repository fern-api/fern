<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\RuntimeError;
use Seed\Core\Json\JsonProperty;

class ErrorInfoOne extends JsonSerializableType
{
    use RuntimeError;

    /**
     * @var value-of<ErrorInfoOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   message: string,
     *   type: value-of<ErrorInfoOneType>,
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
