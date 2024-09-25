<?php

namespace Seed\Service\Requests;

use Seed\Utils\File;
use Seed\Service\Types\MyObject;
use Seed\Service\Types\ObjectType;

class MyRequest
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
    public ?int $maybeInteger;

    /**
     * @var ?array<string> $optionalListOfStrings
     */
    public ?array $optionalListOfStrings;

    /**
     * @var array<MyObject> $listOfObjects
     */
    public array $listOfObjects;

    /**
     * @var mixed $optionalMetadata
     */
    public $optionalMetadata;

    /**
     * @var ?ObjectType $optionalObjectType
     */
    public ?ObjectType $optionalObjectType;

    /**
     * @var ?string $optionalId
     */
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
     *   optionalObjectType?: ?ObjectType,
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