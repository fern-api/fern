<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class U extends JsonSerializableType
{
    /**
     * @var T $child
     */
    #[JsonProperty('child')]
    public T $child;

    /**
     * @param array{
     *   child: T,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->child = $values['child'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
