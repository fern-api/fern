<?php

namespace Seed\Organization;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class CreateOrganizationRequest extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
    }
}
