<?php

namespace Seed\NullableOptional\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Organization extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?string $domain
     */
    #[JsonProperty('domain')]
    public ?string $domain;

    /**
     * @var ?int $employeeCount
     */
    #[JsonProperty('employeeCount')]
    public ?int $employeeCount;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   domain?: ?string,
     *   employeeCount?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->name = $values['name'];$this->domain = $values['domain'] ?? null;$this->employeeCount = $values['employeeCount'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
