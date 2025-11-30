<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\BaseResource;
use Seed\Core\Json\JsonProperty;

class Account extends JsonSerializableType
{
    use BaseResource;

    /**
     * @var 'Account' $resourceType
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
     *   id: string,
     *   relatedResources: array<(
     *    Account
     *   |Patient
     *   |Practitioner
     *   |Script
     * )>,
     *   memo: Memo,
     *   resourceType: 'Account',
     *   name: string,
     *   patient?: ?Patient,
     *   practitioner?: ?Practitioner,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->relatedResources = $values['relatedResources'];$this->memo = $values['memo'];$this->resourceType = $values['resourceType'];$this->name = $values['name'];$this->patient = $values['patient'] ?? null;$this->practitioner = $values['practitioner'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
