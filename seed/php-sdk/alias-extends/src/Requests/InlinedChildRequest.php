<?php

namespace Seed\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InlinedChildRequest extends SerializableType
{
    /**
     * @var string $child
     */
    #[JsonProperty('child')]
    public string $child;

    /**
     * @param array{
     *   child: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->child = $values['child'];
    }
}
