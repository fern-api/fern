<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithNoPropertiesType extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithNoPropertiesTypeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: value-of<UnionWithNoPropertiesTypeType>,
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
