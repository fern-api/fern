<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Nested object for testing
 */
class Address extends JsonSerializableType
{
    /**
     * @var string $street
     */
    #[JsonProperty('street')]
    public string $street;

    /**
     * @var ?string $city
     */
    #[JsonProperty('city')]
    public ?string $city;

    /**
     * @var ?string $state
     */
    #[JsonProperty('state')]
    public ?string $state;

    /**
     * @var string $zipCode
     */
    #[JsonProperty('zipCode')]
    public string $zipCode;

    /**
     * @var ?string $country
     */
    #[JsonProperty('country')]
    public ?string $country;

    /**
     * @var ?string $buildingId
     */
    #[JsonProperty('buildingId')]
    public ?string $buildingId;

    /**
     * @var ?string $tenantId
     */
    #[JsonProperty('tenantId')]
    public ?string $tenantId;

    /**
     * @param array{
     *   street: string,
     *   zipCode: string,
     *   city?: ?string,
     *   state?: ?string,
     *   country?: ?string,
     *   buildingId?: ?string,
     *   tenantId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->street = $values['street'];$this->city = $values['city'] ?? null;$this->state = $values['state'] ?? null;$this->zipCode = $values['zipCode'];$this->country = $values['country'] ?? null;$this->buildingId = $values['buildingId'] ?? null;$this->tenantId = $values['tenantId'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
