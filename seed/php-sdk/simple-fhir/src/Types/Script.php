<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\BaseResource;
use Seed\Core\Json\JsonProperty;

class Script extends JsonSerializableType
{
    use BaseResource;

    /**
     * @var 'Script' $resourceType
     */
    #[JsonProperty('resource_type')]
    public string $resourceType;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

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
     *   resourceType: 'Script',
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->relatedResources = $values['relatedResources'];$this->memo = $values['memo'];$this->resourceType = $values['resourceType'];$this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
