<?php

namespace Seed\Endpoints\Pagination;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Object\ObjectWithRequiredField;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class PaginatedResponse extends JsonSerializableType
{
    /**
     * @var array<ObjectWithRequiredField> $items
     */
    #[JsonProperty('items'), ArrayType([ObjectWithRequiredField::class])]
    public array $items;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;

    /**
     * @param array{
     *   items: array<ObjectWithRequiredField>,
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
