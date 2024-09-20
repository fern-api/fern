<?php

namespace Seed\Service\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WithDocs extends SerializableType
{
    /**
     * @var string $docs
     */
    #[JsonProperty("docs")]
    public string $docs;

    /**
     * @param array{
     *   docs: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->docs = $values['docs'];
    }
}
