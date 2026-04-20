<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BaseOrgMetadata extends JsonSerializableType
{
    /**
     * @var string $region Deployment region from BaseOrg.
     */
    #[JsonProperty('region')]
    public string $region;

    /**
     * @var ?string $tier Subscription tier.
     */
    #[JsonProperty('tier')]
    public ?string $tier;

    /**
     * @param array{
     *   region: string,
     *   tier?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->region = $values['region'];
        $this->tier = $values['tier'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
