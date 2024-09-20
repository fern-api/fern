<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Account extends SerializableType
{
    /**
     * @var string $resourceType
     */
    #[JsonProperty('resource_type')]
    public string $resourceType;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?Patient $patient
     */
    #[JsonProperty('patient')]
    public ?Patient $patient;

    /**
     * @var ?Practitioner $practitioner
     */
    #[JsonProperty('practitioner')]
    public ?Practitioner $practitioner;

    /**
     * @param array{
     *   resourceType: string,
     *   name: string,
     *   patient?: ?Patient,
     *   practitioner?: ?Practitioner,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->resourceType = $values['resourceType'];
        $this->name = $values['name'];
        $this->patient = $values['patient'] ?? null;
        $this->practitioner = $values['practitioner'] ?? null;
    }
}
