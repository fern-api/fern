<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Parent_;
use Seed\Core\Json\JsonProperty;

class Child extends JsonSerializableType
{
    use Parent_;

    /**
     * @var string $child
     */
    #[JsonProperty('child')]
    public string $child;

    /**
     * @param array{
     *   parent: string,
     *   child: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->parent = $values['parent'];$this->child = $values['child'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
