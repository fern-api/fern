<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\BaseResource;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Patient extends JsonSerializableType
{
    use BaseResource;

    /**
     * @var value-of<PatientResourceType> $resourceType
     */
    #[JsonProperty('resource_type')]
    public string $resourceType;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var array<Script> $scripts
     */
    #[JsonProperty('scripts'), ArrayType([Script::class])]
    public array $scripts;

    /**
     * @param array{
     *   id: string,
     *   relatedResources: array<ResourceList>,
     *   memo: Memo,
     *   resourceType: value-of<PatientResourceType>,
     *   name: string,
     *   scripts: array<Script>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->relatedResources = $values['relatedResources'];
        $this->memo = $values['memo'];
        $this->resourceType = $values['resourceType'];
        $this->name = $values['name'];
        $this->scripts = $values['scripts'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
