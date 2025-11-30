<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class UnionResponse extends JsonSerializableType
{
    /**
     * @var (
     *    VariantA
     *   |VariantB
     *   |VariantC
     * ) $data
     */
    #[JsonProperty('data'), Union(VariantA::class,VariantB::class,VariantC::class)]
    public VariantA|VariantB|VariantC $data;

    /**
     * @param array{
     *   data: (
     *    VariantA
     *   |VariantB
     *   |VariantC
     * ),
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
