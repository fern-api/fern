<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $id
 * @property string $name
 * @property ?string $domain
 * @property ?int $employeeCount
 */
trait Organization
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
}
