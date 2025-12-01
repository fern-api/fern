<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\AliasType;
use Seed\Core\Json\JsonProperty;

class InlinedChildRequest extends JsonSerializableType
{
    use AliasType;

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
    )
    {
        $this->child = $values['child'];$this->parent = $values['parent'];
    }
}
