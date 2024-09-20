<?php

namespace Seed\Organization\Types;

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
