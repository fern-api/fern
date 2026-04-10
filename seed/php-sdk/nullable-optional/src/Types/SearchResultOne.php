<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Organization;
use Seed\Core\Json\JsonProperty;

class SearchResultOne extends JsonSerializableType
{
    use Organization;

    /**
     * @var value-of<SearchResultOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   type: value-of<SearchResultOneType>,
     *   domain?: ?string,
     *   employeeCount?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->name = $values['name'];
        $this->domain = $values['domain'] ?? null;
        $this->employeeCount = $values['employeeCount'] ?? null;
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
