<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class OptionalMergePatchRequest extends JsonSerializableType
{
    /**
     * @var string $requiredField
     */
    #[JsonProperty('requiredField')]
    public string $requiredField;

    /**
     * @var ?string $optionalString
     */
    #[JsonProperty('optionalString')]
    public ?string $optionalString;

    /**
     * @var ?int $optionalInteger
     */
    #[JsonProperty('optionalInteger')]
    public ?int $optionalInteger;

    /**
     * @var ?bool $optionalBoolean
     */
    #[JsonProperty('optionalBoolean')]
    public ?bool $optionalBoolean;

    /**
     * @var ?string $nullableString
     */
    #[JsonProperty('nullableString')]
    public ?string $nullableString;

    /**
     * @param array{
     *   requiredField: string,
     *   optionalString?: ?string,
     *   optionalInteger?: ?int,
     *   optionalBoolean?: ?bool,
     *   nullableString?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->requiredField = $values['requiredField'];$this->optionalString = $values['optionalString'] ?? null;$this->optionalInteger = $values['optionalInteger'] ?? null;$this->optionalBoolean = $values['optionalBoolean'] ?? null;$this->nullableString = $values['nullableString'] ?? null;
    }
}
