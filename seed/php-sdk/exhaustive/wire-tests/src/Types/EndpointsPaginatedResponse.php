<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class EndpointsPaginatedResponse extends JsonSerializableType
{
    /**
     * @var array<TypesObjectWithRequiredField> $items
     */
    #[JsonProperty('items'), ArrayType([TypesObjectWithRequiredField::class])]
    public array $items;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;

    /**
     * @param array{
     *   items: array<TypesObjectWithRequiredField>,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->items = $values['items'];
        $this->next = $values['next'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
