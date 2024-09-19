<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Account extends SerializableType
{
    /**
     * @var string $resourceType
     */
    #[JsonProperty("resource_type")]
    public string $resourceType;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var ?Patient $patient
     */
    #[JsonProperty("patient")]
    public ?Patient $patient;

    /**
     * @var ?Practitioner $practitioner
     */
    #[JsonProperty("practitioner")]
    public ?Practitioner $practitioner;

    /**
     * @param string $resourceType
     * @param string $name
     * @param ?Patient $patient
     * @param ?Practitioner $practitioner
     */
    public function __construct(
        string $resourceType,
        string $name,
        ?Patient $patient = null,
        ?Practitioner $practitioner = null,
    ) {
        $this->resourceType = $resourceType;
        $this->name = $name;
        $this->patient = $patient;
        $this->practitioner = $practitioner;
    }
}
