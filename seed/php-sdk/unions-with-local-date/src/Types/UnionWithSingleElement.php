<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Foo;
use Seed\Core\Json\JsonProperty;

class UnionWithSingleElement extends JsonSerializableType
{
    use Foo;

    /**
     * @var value-of<UnionWithSingleElementType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   name: string,
     *   type: value-of<UnionWithSingleElementType>,
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
