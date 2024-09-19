<?php

namespace Seed\Foo;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ImportingType extends SerializableType
{
    /**
     * @var string $imported
     */
    #[JsonProperty("imported")]
    public string $imported;

    /**
     * @param string $imported
     */
    public function __construct(
        string $imported,
    ) {
        $this->imported = $imported;
    }
}
