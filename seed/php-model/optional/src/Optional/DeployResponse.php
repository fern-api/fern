<?php

namespace Seed\Optional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DeployResponse extends JsonSerializableType
{
    /**
     * @var bool $success
     */
    #[JsonProperty('success')]
    public bool $success;

    /**
     * @param array{
     *   success: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->success = $values['success'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
