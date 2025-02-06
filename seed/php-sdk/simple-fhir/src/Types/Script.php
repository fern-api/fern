<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\BaseResource;
use Seed\Core\Json\JsonProperty;

class Script extends JsonSerializableType
{
    use BaseResource;

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
     * @param array{
     *   resourceType: string,
     *   name: string,
     *   id: string,
     *   relatedResources: array<Account|Patient|Practitioner|Script>,
     *   memo: Memo,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->resourceType = $values['resourceType'];
        $this->name = $values['name'];
        $this->id = $values['id'];
        $this->relatedResources = $values['relatedResources'];
        $this->memo = $values['memo'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
