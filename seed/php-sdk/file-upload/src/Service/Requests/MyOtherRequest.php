<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Utils\File;
use Seed\Core\Types\ArrayType;
use Seed\Service\Types\MyObject;
use Seed\Service\Types\ObjectType;
use Seed\Service\Types\MyObjectWithOptional;

class MyOtherRequest extends JsonSerializableType
{
    /**
     * @var ?string $maybeString
     */
    #[JsonProperty('maybe_string')]
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
    #[JsonProperty('maybe_integer')]
    public ?int $maybeInteger;

    /**
     * @var ?array<string> $optionalListOfStrings
     */
    #[JsonProperty('optional_list_of_strings'), ArrayType(['string'])]
    public ?array $optionalListOfStrings;

    /**
     * @var array<MyObject> $listOfObjects
     */
    #[JsonProperty('list_of_objects'), ArrayType([MyObject::class])]
    public array $listOfObjects;

    /**
     * @var mixed $optionalMetadata
     */
    #[JsonProperty('optional_metadata')]
    public mixed $optionalMetadata;

    /**
     * @var ?value-of<ObjectType> $optionalObjectType
     */
    #[JsonProperty('optional_object_type')]
    public ?string $optionalObjectType;

    /**
     * @var ?string $optionalId
     */
    #[JsonProperty('optional_id')]
    public ?string $optionalId;

    /**
     * @var array<MyObjectWithOptional> $listOfObjectsWithOptionals
     */
    #[JsonProperty('list_of_objects_with_optionals'), ArrayType([MyObjectWithOptional::class])]
    public array $listOfObjectsWithOptionals;

    /**
     * @var MyObject $aliasObject
     */
    #[JsonProperty('alias_object')]
    public MyObject $aliasObject;

    /**
     * @var array<MyObject> $listOfAliasObject
     */
    #[JsonProperty('list_of_alias_object'), ArrayType([MyObject::class])]
    public array $listOfAliasObject;

    /**
     * @var array<MyObject> $aliasListOfObject
     */
    #[JsonProperty('alias_list_of_object'), ArrayType([MyObject::class])]
    public array $aliasListOfObject;

    /**
     * @param array{
     *   integer: int,
     *   file: File,
     *   fileList: array<File>,
     *   listOfObjects: array<MyObject>,
     *   listOfObjectsWithOptionals: array<MyObjectWithOptional>,
     *   aliasObject: MyObject,
     *   listOfAliasObject: array<MyObject>,
     *   aliasListOfObject: array<MyObject>,
     *   maybeString?: ?string,
     *   maybeFile?: ?File,
     *   maybeFileList?: ?array<File>,
     *   maybeInteger?: ?int,
     *   optionalListOfStrings?: ?array<string>,
     *   optionalMetadata?: mixed,
     *   optionalObjectType?: ?value-of<ObjectType>,
     *   optionalId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->maybeString = $values['maybeString'] ?? null;$this->integer = $values['integer'];$this->file = $values['file'];$this->fileList = $values['fileList'];$this->maybeFile = $values['maybeFile'] ?? null;$this->maybeFileList = $values['maybeFileList'] ?? null;$this->maybeInteger = $values['maybeInteger'] ?? null;$this->optionalListOfStrings = $values['optionalListOfStrings'] ?? null;$this->listOfObjects = $values['listOfObjects'];$this->optionalMetadata = $values['optionalMetadata'] ?? null;$this->optionalObjectType = $values['optionalObjectType'] ?? null;$this->optionalId = $values['optionalId'] ?? null;$this->listOfObjectsWithOptionals = $values['listOfObjectsWithOptionals'];$this->aliasObject = $values['aliasObject'];$this->listOfAliasObject = $values['listOfAliasObject'];$this->aliasListOfObject = $values['aliasListOfObject'];
    }
}
