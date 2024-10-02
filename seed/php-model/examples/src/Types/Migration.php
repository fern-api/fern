<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Migration extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var value-of<MigrationStatus> $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @param array{
     *   name: string,
     *   status: value-of<MigrationStatus>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->status = $values['status'];
    }
}
