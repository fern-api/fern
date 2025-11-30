<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class UnionListResponse extends JsonSerializableType
{
    /**
     * @var array<(
     *    VariantA
     *   |VariantB
     *   |VariantC
     * )> $data
     */
    #[JsonProperty('data'), ArrayType([new Union(VariantA::class, VariantB::class, VariantC::class)])]
    public array $data;

    /**
     * @param array{
     *   data: array<(
     *    VariantA
     *   |VariantB
     *   |VariantC
     * )>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
