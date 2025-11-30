<?php

namespace Seed\Level1\Level2\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Address extends JsonSerializableType
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
     * @var 'USA' $country
     */
    #[JsonProperty('country')]
    public string $country;

    /**
     * @param array{
     *   line1: string,
     *   city: string,
     *   state: string,
     *   zip: string,
     *   country: 'USA',
     *   line2?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->line1 = $values['line1'];$this->line2 = $values['line2'] ?? null;$this->city = $values['city'];$this->state = $values['state'];$this->zip = $values['zip'];$this->country = $values['country'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
