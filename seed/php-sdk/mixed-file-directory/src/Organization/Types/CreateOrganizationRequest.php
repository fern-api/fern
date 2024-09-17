<?php

namespace Seed\Organization\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CreateOrganizationRequest extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
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
