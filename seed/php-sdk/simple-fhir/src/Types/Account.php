<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\Patient;
use Seed\Types\Practitioner;

class Account extends SerializableType
{
    #[JsonProperty("resource_type")]
    /**
     * @var string $resourceType
     */
    public string $resourceType;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("patient")]
    /**
     * @var ?Patient $patient
     */
    public ?Patient $patient;

    #[JsonProperty("practitioner")]
    /**
     * @var ?Practitioner $practitioner
     */
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
