<?php

namespace Seed\Simple;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FooRequest extends JsonSerializableType
{
    /**
     * @var string $bar
     */
    #[JsonProperty('bar')]
    public string $bar;

    /**
     * @param array{
     *   bar: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->bar = $values['bar'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
