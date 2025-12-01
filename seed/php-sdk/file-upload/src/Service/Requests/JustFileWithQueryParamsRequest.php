<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;

class JustFileWithQueryParamsRequest extends JsonSerializableType
{
    /**
     * @var ?string $maybeString
     */
    public ?string $maybeString;

    /**
     * @var int $integer
     */
    public int $integer;

    /**
     * @var ?int $maybeInteger
     */
    public ?int $maybeInteger;

    /**
     * @var array<string> $listOfStrings
     */
    public array $listOfStrings;

    /**
     * @var ?array<string> $optionalListOfStrings
     */
    public ?array $optionalListOfStrings;

    /**
     * @var File $file
     */
    public File $file;

    /**
     * @param array{
     *   integer: int,
     *   listOfStrings: array<string>,
     *   file: File,
     *   maybeString?: ?string,
     *   maybeInteger?: ?int,
     *   optionalListOfStrings?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->maybeString = $values['maybeString'] ?? null;$this->integer = $values['integer'];$this->maybeInteger = $values['maybeInteger'] ?? null;$this->listOfStrings = $values['listOfStrings'];$this->optionalListOfStrings = $values['optionalListOfStrings'] ?? null;$this->file = $values['file'];
    }
}
