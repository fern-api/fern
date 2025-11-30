<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Failure extends JsonSerializableType
{
    /**
     * @var 'failure' $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @param array{
     *   status: 'failure',
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
