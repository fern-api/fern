<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ObjectValue;
use Seed\Core\Json\JsonProperty;

class FieldValueOne extends JsonSerializableType
{
    use ObjectValue;

    /**
     * @var value-of<FieldValueOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: value-of<FieldValueOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
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
