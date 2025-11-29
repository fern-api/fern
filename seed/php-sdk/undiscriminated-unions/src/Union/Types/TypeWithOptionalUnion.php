<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class TypeWithOptionalUnion extends JsonSerializableType
{
    /**
     * @var (
     *    string
     *   |array<string>
     *   |int
     *   |array<int>
     *   |array<array<int>>
     * )|null $myUnion
     */
    #[JsonProperty('myUnion'), Union('string',['string'],'integer',['integer'],[['integer']],'null')]
    public string|array|int|null $myUnion;

    /**
     * @param array{
     *   myUnion?: (
     *    string
     *   |array<string>
     *   |int
     *   |array<int>
     *   |array<array<int>>
     * )|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->myUnion = $values['myUnion'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
