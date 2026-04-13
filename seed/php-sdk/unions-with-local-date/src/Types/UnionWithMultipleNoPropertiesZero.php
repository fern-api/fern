<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Foo;
use Seed\Core\Json\JsonProperty;

class UnionWithMultipleNoPropertiesZero extends JsonSerializableType
{
    use Foo;

    /**
     * @var value-of<UnionWithMultipleNoPropertiesZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   name: string,
     *   type: value-of<UnionWithMultipleNoPropertiesZeroType>,
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
