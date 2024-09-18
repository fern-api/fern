<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Migration extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var MigrationStatus $status
     */
    #[JsonProperty("status")]
    public MigrationStatus $status;

    /**
     * @param string $name
     * @param MigrationStatus $status
     */
    public function __construct(
        string $name,
        MigrationStatus $status,
    ) {
        $this->name = $name;
        $this->status = $status;
    }
}
