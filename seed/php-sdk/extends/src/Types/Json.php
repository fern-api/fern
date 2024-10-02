<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Traits\Docs;
use Seed\Core\Json\JsonProperty;

class Json extends SerializableType
{
    use Docs;

    /**
     * @var string $raw
     */
    #[JsonProperty('raw')]
    public string $raw;

    /**
     * @param array{
     *   raw: string,
     *   docs: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->raw = $values['raw'];
        $this->docs = $values['docs'];
    }
}
