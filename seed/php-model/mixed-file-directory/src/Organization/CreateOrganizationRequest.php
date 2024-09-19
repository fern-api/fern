<?php

namespace Seed\Organization;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CreateOrganizationRequest extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @param string $name
     */
    public function __construct(
        string $name,
    ) {
        $this->name = $name;
    }
}
