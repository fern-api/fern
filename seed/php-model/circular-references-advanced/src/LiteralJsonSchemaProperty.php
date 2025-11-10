<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class LiteralJsonSchemaProperty extends JsonSerializableType
{
    /**
     * @var ?value-of<LiteralJsonSchemaPropertyType> $type
     */
    #[JsonProperty('type')]
    public ?string $type;

    /**
     * @var ?string $description
     */
    #[JsonProperty('description')]
    public ?string $description;

    /**
     * @param array{
     *   type?: ?value-of<LiteralJsonSchemaPropertyType>,
     *   description?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->type = $values['type'] ?? null;
        $this->description = $values['description'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
