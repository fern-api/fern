<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class TypeWithOptionalUnion extends JsonSerializableType
{
    /**
     * @var (
     *    string
     *   |int
     *   |array<int>
     *   |array<array<int>>
     *   |array<string>
     * )|null $myUnion
     */
    #[JsonProperty('myUnion'), Union('string', 'integer', ['integer'], [['integer']], ['string'], 'null')]
    public string|int|array|null $myUnion;

    /**
     * @param array{
     *   myUnion?: (
     *    string
     *   |int
     *   |array<int>
     *   |array<array<int>>
     *   |array<string>
     * )|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->myUnion = $values['myUnion'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
