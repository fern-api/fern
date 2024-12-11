<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineType2 extends JsonSerializableType
{
    /**
     * @var string $baz
     */
    #[JsonProperty('baz')]
    public string $baz;

    /**
     * @param array{
     *   baz: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->baz = $values['baz'];
    }
}
