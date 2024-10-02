<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Traits\Parent_;
use Seed\Core\Json\JsonProperty;

class Child extends SerializableType
{
    use Parent_;

    /**
     * @var string $child
     */
    #[JsonProperty('child')]
    public string $child;

    /**
     * @param array{
     *   child: string,
     *   parent: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->child = $values['child'];
        $this->parent = $values['parent'];
    }
}
