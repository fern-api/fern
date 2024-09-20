<?php

namespace Seed\Foo\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ImportingType extends SerializableType
{
    /**
     * @var string $imported
     */
    #[JsonProperty('imported')]
    public string $imported;

    /**
     * @param array{
     *   imported: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->imported = $values['imported'];
    }
}
