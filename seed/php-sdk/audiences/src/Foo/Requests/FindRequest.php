<?php

namespace Seed\Foo\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FindRequest extends SerializableType
{
    /**
     * @var ?string $optionalString
     */
    public ?string $optionalString;

    /**
     * @var ?string $publicProperty
     */
    #[JsonProperty('publicProperty')]
    public ?string $publicProperty;

    /**
     * @var ?int $privateProperty
     */
    #[JsonProperty('privateProperty')]
    public ?int $privateProperty;

    /**
     * @param array{
     *   optionalString?: ?string,
     *   publicProperty?: ?string,
     *   privateProperty?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->optionalString = $values['optionalString'] ?? null;
        $this->publicProperty = $values['publicProperty'] ?? null;
        $this->privateProperty = $values['privateProperty'] ?? null;
    }
}
