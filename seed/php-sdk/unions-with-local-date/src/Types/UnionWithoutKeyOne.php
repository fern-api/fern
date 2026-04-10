<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Bar;
use Seed\Core\Json\JsonProperty;

class UnionWithoutKeyOne extends JsonSerializableType
{
    use Bar;

    /**
     * @var value-of<UnionWithoutKeyOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   name: string,
     *   type: value-of<UnionWithoutKeyOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
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
