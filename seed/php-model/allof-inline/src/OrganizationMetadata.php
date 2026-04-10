<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class OrganizationMetadata extends JsonSerializableType
{
    /**
     * @var string $region Deployment region from DetailedOrg.
     */
    #[JsonProperty('region')]
    public string $region;

    /**
     * @var ?string $domain Custom domain name.
     */
    #[JsonProperty('domain')]
    public ?string $domain;

    /**
     * @param array{
     *   region: string,
     *   domain?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->region = $values['region'];
        $this->domain = $values['domain'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
