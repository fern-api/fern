<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Failure extends SerializableType
{
    /**
     * @var string $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @param array{
     *   status: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->status = $values['status'];
    }
}
