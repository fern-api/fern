<?php

namespace Seed\Service\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class NoFileRequest extends SerializableType
{
    /**
     * @var ?string $maybeString
     */
    #[JsonProperty('maybeString')]
    public ?string $maybeString;

    /**
     * @var int $integer
     */
    #[JsonProperty('integer')]
    public int $integer;

    /**
     * @var ?int $maybeInteger
     */
    #[JsonProperty('maybeInteger')]
    public ?int $maybeInteger;

    /**
     * @var ?array<string> $optionalListOfStrings
     */
    #[JsonProperty('optionalListOfStrings'), ArrayType(['string'])]
    public ?array $optionalListOfStrings;

    /**
     * @param array{
     *   maybeString?: ?string,
     *   integer: int,
     *   maybeInteger?: ?int,
     *   optionalListOfStrings?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->maybeString = $values['maybeString'] ?? null;
        $this->integer = $values['integer'];
        $this->maybeInteger = $values['maybeInteger'] ?? null;
        $this->optionalListOfStrings = $values['optionalListOfStrings'] ?? null;
    }
}
