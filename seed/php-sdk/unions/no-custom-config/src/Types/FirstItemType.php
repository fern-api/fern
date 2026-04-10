<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FirstItemType extends JsonSerializableType
{
    /**
     * @var ?value-of<FirstItemTypeType> $type
     */
    #[JsonProperty('type')]
    public ?string $type;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   name: string,
     *   type?: ?value-of<FirstItemTypeType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'] ?? null;
        $this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
