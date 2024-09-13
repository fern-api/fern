<?php

namespace Seed\Types;

use DateTime;
use DateTimeInterface;
use ReflectionClass;
use ReflectionProperty;
use Seed\Core\ArrayType;
use Seed\Core\DateType;
use Seed\Core\JsonProperty;

class ExampleType
{
    public function __construct(
        #[JsonProperty('name')]
        public string $name,

        #[JsonProperty('age')]
        public int $age,

        #[JsonProperty('price')]
        public float $price,

        #[JsonProperty('is_active')]
        public bool $isActive,

        #[DateType(DateType::TYPE_DATE)]
        #[JsonProperty('start_date')]
        public DateTime $startDate,

        #[DateType(DateType::TYPE_DATETIME)]
        #[JsonProperty('created_at')]
        public DateTime $createdAt,

        #[ArrayType(['string'])]
        #[JsonProperty('string_list')]
        /** @var string[] $stringList */
        public array $stringList,

        #[ArrayType(['string' => 'int'])]
        #[JsonProperty('string_int_map')]
        public array $stringIntMap,

        #[ArrayType([['string']])]
        #[JsonProperty('nested_string_list')]
        public array $nestedStringList,

        #[ArrayType(['int' => ['int' => ExampleNestedType::class]])]
        #[JsonProperty('nested_type_map')]
        public array $nestedTypeMap,

        #[JsonProperty('optional_name')]
        public ?string $optionalName = null
    ) {}

    /**
     * Deserializes an array (e.g. from json_decode) into an ExampleType object.
     *
     * @param array $data The array to deserialize.
     * @return self
     */
    public static function fromArray(array $data): self
    {
        $instance = new self();
        $reflectionClass = new ReflectionClass(self::class);
        foreach ($reflectionClass->getProperties() as $property) {
            $jsonKey = self::getJsonKey($property);
            if (isset($data[$jsonKey])) {
                $value = $data[$jsonKey];

                // Handle DateType annotation
                $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
                if ($dateTypeAttr) {
                    $dateType = $dateTypeAttr->newInstance()->type;
                    if ($dateType === DateType::TYPE_DATE) {
                        $value = DateTime::createFromFormat('Y-m-d', $value);
                    } else {
                        $value = new DateTime($value);
                    }
                }

                // Handle ArrayType annotation
                $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
                if (is_array($value) && $arrayTypeAttr) {
                    $arrayType = $arrayTypeAttr->newInstance()->type;
                    $value = self::deserializeGenericArray($value, $arrayType);
                }

                $property->setAccessible(true);
                $property->setValue($instance, $value);
            }
        }
        return $instance;
    }

    /**
     * Serializes the object to an array for JSON encoding.
     *
     * @return array
     */
    public function toArray(): array
    {
        $result = [];
        $reflectionClass = new ReflectionClass(self::class);
        foreach ($reflectionClass->getProperties() as $property) {
            $jsonKey = self::getJsonKey($property);
            $value = $property->getValue($this);

            // Handle DateTime properties
            $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
            if ($dateTypeAttr) {
                $dateType = $dateTypeAttr->newInstance()->type;
                if ($value instanceof DateTime) {
                    if ($dateType === DateType::TYPE_DATE) {
                        $value = $value->format('Y-m-d');
                    } else {
                        $value = $value->format(DateTimeInterface::RFC3339);
//                        $value = $value->format(DateTimeInterface::RFC3339);
                    }
                }
            }

            // Handle arrays
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if ($arrayTypeAttr && is_array($value)) {
                $arrayType = $arrayTypeAttr->newInstance()->type;
                $value = self::serializeGenericArray($value, $arrayType);
            }

            $result[$jsonKey] = $value;
        }
        return $result;
    }

    /**
     * Casts the key to the appropriate type based on the key type.
     * Example: If the key type is 'int', the key will be cast to an integer.
     *
     * @param mixed $key The key to be cast.
     * @param string $keyType The type to cast the key to ('string', 'int', 'float').
     * @return mixed The casted key.
     */
    private static function castKey(mixed $key, string $keyType): mixed
    {
        if ($keyType === 'int') {
            return (int)$key;
        } elseif ($keyType === 'float') {
            return (float)$key;
        } elseif ($keyType === 'string') {
            return (string)$key;
        }

        return $key;
    }

    /**
     * Serializes the given array based on the type annotation.
     * Distinguishes between lists (e.g., ['valueType']) and maps (e.g., ['keyType' => 'valueType']).
     *
     * @param array $data The array to be serialized.
     * @param array $type The type definition from the annotation (e.g., ['string' => 'int']).
     * @return array The serialized array.
     */
    private static function serializeGenericArray(array $data, array $type): array
    {
        // If the type is a map (['keyType' => 'valueType']), use serializeMap.
        if (self::isMapType($type)) {
            return self::serializeMap($data, $type);
        }

        // Otherwise, it's a list (['valueType']), so use serializeList.
        return self::serializeList($data, $type);
    }

    /**
     * Serializes a map (associative array) where the key and value types are defined.
     * Example: ['string' => 'int'] represents a map from string to int.
     *
     * @param array $data The associative array to serialize.
     * @param array $type The type definition for the map.
     * @return array The serialized map.
     */
    private static function serializeMap(array $data, array $type): array
    {
        $keyType = array_key_first($type);  // Extract key type, e.g., 'string'
        $valueType = $type[$keyType];       // Extract value type, e.g., 'int'

        $result = [];
        foreach ($data as $key => $item) {
            // Cast the key to its proper type
            $key = self::castKey($key, $keyType);

            // Recursively serialize the value based on its type
            if (is_array($valueType)) {
                $result[$key] = self::serializeGenericArray($item, $valueType);
            } elseif (is_object($item) && method_exists($item, 'toArray')) {
                $result[$key] = $item->toArray();
            } else {
                $result[$key] = $item;
            }
        }

        return $result;
    }

    /**
     * Serializes a list (indexed array) where only the value type is defined.
     * Example: ['valueType'] represents a list of items of type 'valueType'.
     *
     * @param array $data The list to serialize.
     * @param array $type The type definition for the list.
     * @return array The serialized list.
     */
    private static function serializeList(array $data, array $type): array
    {
        $valueType = $type[0];  // Extract value type, e.g., 'string', 'int'

        return array_map(function ($item) use ($valueType) {
            // Recursively serialize nested arrays or objects
            if (is_array($valueType)) {
                return self::serializeGenericArray($item, $valueType);
            } elseif (is_object($item) && method_exists($item, 'toArray')) {
                return $item->toArray();
            } else {
                return $item;
            }
        }, $data);
    }

    /**
     * Deserializes the given array based on the type annotation.
     * Distinguishes between lists (e.g., ['valueType']) and maps (e.g., ['keyType' => 'valueType']).
     *
     * @param array $data The array to be deserialized.
     * @param array $type The type definition from the annotation (e.g., ['string' => 'int']).
     * @return array The deserialized array.
     */
    private static function deserializeGenericArray(array $data, array $type): array
    {
        // If the type is a map (['keyType' => 'valueType']), use deserializeMap.
        if (self::isMapType($type)) {
            return self::deserializeMap($data, $type);
        }

        // Otherwise, it's a list (['valueType']), so use deserializeList.
        return self::deserializeList($data, $type);
    }

    /**
     * Deserializes a map (associative array) where the key and value types are defined.
     * Example: ['string' => 'int'] represents a map from string to int.
     *
     * @param array $data The associative array to deserialize.
     * @param array $type The type definition for the map.
     * @return array The deserialized map.
     */
    private static function deserializeMap(array $data, array $type): array
    {
        $keyType = array_key_first($type);  // Extract key type, e.g., 'string'
        $valueType = $type[$keyType];       // Extract value type, e.g., 'int'

        $result = [];
        foreach ($data as $key => $item) {
            // Cast the key to its proper type
            $key = self::castKey($key, $keyType);

            // Recursively deserialize the value based on its type
            if (is_array($valueType)) {
                $result[$key] = self::deserializeGenericArray($item, $valueType);
            } elseif (class_exists($valueType)) {
                // If the valueType is a class, instantiate it using fromArray
                $result[$key] = $valueType::fromArray($item);
            } else {
                $result[$key] = $item;
            }
        }

        return $result;
    }

    /**
     * Deserializes a list (indexed array) where only the value type is defined.
     * Example: ['valueType'] represents a list of items of type 'valueType'.
     *
     * @param array $data The list to deserialize.
     * @param array $type The type definition for the list.
     * @return array The deserialized list.
     */
    private static function deserializeList(array $data, array $type): array
    {
        $valueType = $type[0];  // Extract value type, e.g., 'string', 'int'

        return array_map(function ($item) use ($valueType) {
            // Recursively deserialize nested arrays or objects
            if (is_array($valueType)) {
                return self::deserializeGenericArray($item, $valueType);
            } elseif (class_exists($valueType)) {
                return $valueType::fromArray($item);
            } else {
                return $item;
            }
        }, $data);
    }

    /**
     * Determines if the given type represents a map.
     * A map is represented as an associative array (e.g., ['keyType' => 'valueType']).
     *
     * @param array $type The type definition from the annotation.
     * @return bool True if the type is a map, false if it's a list.
     */
    private static function isMapType(array $type): bool
    {
        return count($type) === 1 && array_is_list($type) === false;
    }

    /**
     * Helper function to retrieve the JSON key for a property (uses JsonProperty if available).
     *
     * @param ReflectionProperty $property
     * @return string
     */
    private static function getJsonKey(ReflectionProperty $property): string
    {
        $jsonPropertyAttr = $property->getAttributes(JsonProperty::class)[0] ?? null;
        return $jsonPropertyAttr ? $jsonPropertyAttr->newInstance()->name : $property->getName();
    }
}
