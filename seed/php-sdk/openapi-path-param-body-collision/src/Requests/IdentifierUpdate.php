<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class IdentifierUpdate extends JsonSerializableType
{
    /**
     * @var string $idType The identifier type to update.
     */
    #[JsonProperty('idType')]
    public string $idType;

    /**
     * @var string $oldValue
     */
    #[JsonProperty('oldValue')]
    public string $oldValue;

    /**
     * @var string $newValue
     */
    #[JsonProperty('newValue')]
    public string $newValue;

    /**
     * @param array{
     *   idType: string,
     *   oldValue: string,
     *   newValue: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->idType = $values['idType'];
        $this->oldValue = $values['oldValue'];
        $this->newValue = $values['newValue'];
    }
}
