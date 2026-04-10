<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Level1Level2Address extends JsonSerializableType
{
    /**
     * @var string $line1
     */
    #[JsonProperty('line1')]
    public string $line1;

    /**
     * @var ?string $line2
     */
    #[JsonProperty('line2')]
    public ?string $line2;

    /**
     * @var string $city
     */
    #[JsonProperty('city')]
    public string $city;

    /**
     * @var string $state
     */
    #[JsonProperty('state')]
    public string $state;

    /**
     * @var string $zip
     */
    #[JsonProperty('zip')]
    public string $zip;

    /**
     * @var value-of<Level1Level2AddressCountry> $country
     */
    #[JsonProperty('country')]
    public string $country;

    /**
     * @param array{
     *   line1: string,
     *   city: string,
     *   state: string,
     *   zip: string,
     *   country: value-of<Level1Level2AddressCountry>,
     *   line2?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->line1 = $values['line1'];
        $this->line2 = $values['line2'] ?? null;
        $this->city = $values['city'];
        $this->state = $values['state'];
        $this->zip = $values['zip'];
        $this->country = $values['country'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
