<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UnionListResponse extends JsonSerializableType
{
    /**
     * @var array<MyUnion> $data
     */
    #[JsonProperty('data'), ArrayType([MyUnion::class])]
    public array $data;

    /**
     * @param array{
     *   data: array<MyUnion>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
