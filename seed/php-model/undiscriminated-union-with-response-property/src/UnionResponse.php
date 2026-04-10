<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionResponse extends JsonSerializableType
{
    /**
     * @var MyUnion $data
     */
    #[JsonProperty('data')]
    public MyUnion $data;

    /**
     * @param array{
     *   data: MyUnion,
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
