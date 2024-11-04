<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Utils\File;
use Seed\Core\Types\ArrayType;
use Seed\Service\Types\MyObject;
use Seed\Service\Types\ObjectType;

class MyRequest extends JsonSerializableType
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
     * @var File $file
     */
    public File $file;

    /**
     * @var array<File> $fileList
     */
    public array $fileList;

    /**
     * @var ?File $maybeFile
     */
    public ?File $maybeFile;

    /**
     * @var ?array<File> $maybeFileList
     */
    public ?array $maybeFileList;

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
     * @var array<MyObject> $listOfObjects
     */
    #[JsonProperty('listOfObjects'), ArrayType([MyObject::class])]
    public array $listOfObjects;

    /**
     * @var mixed $optionalMetadata
     */
    #[JsonProperty('optionalMetadata')]
    public mixed $optionalMetadata;

    /**
     * @var ?value-of<ObjectType> $optionalObjectType
     */
    #[JsonProperty('optionalObjectType')]
    public ?string $optionalObjectType;

    /**
     * @var ?string $optionalId
     */
    #[JsonProperty('optionalId')]
    public ?string $optionalId;

    /**
     * @param array{
     *   maybeString?: ?string,
     *   integer: int,
     *   file: File,
     *   fileList: array<File>,
     *   maybeFile?: ?File,
     *   maybeFileList?: ?array<File>,
     *   maybeInteger?: ?int,
     *   optionalListOfStrings?: ?array<string>,
     *   listOfObjects: array<MyObject>,
     *   optionalMetadata?: mixed,
     *   optionalObjectType?: ?value-of<ObjectType>,
     *   optionalId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->maybeString = $values['maybeString'] ?? null;
        $this->integer = $values['integer'];
        $this->file = $values['file'];
        $this->fileList = $values['fileList'];
        $this->maybeFile = $values['maybeFile'] ?? null;
        $this->maybeFileList = $values['maybeFileList'] ?? null;
        $this->maybeInteger = $values['maybeInteger'] ?? null;
        $this->optionalListOfStrings = $values['optionalListOfStrings'] ?? null;
        $this->listOfObjects = $values['listOfObjects'];
        $this->optionalMetadata = $values['optionalMetadata'] ?? null;
        $this->optionalObjectType = $values['optionalObjectType'] ?? null;
        $this->optionalId = $values['optionalId'] ?? null;
    }
}
