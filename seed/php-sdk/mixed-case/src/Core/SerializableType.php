<?php

namespace Seed\Core;

use DateTime;
use Exception;
use ReflectionProperty;

/**
 * Provides generic serialization and deserialization methods.
 */
abstract class SerializableType implements \JsonSerializable
{
    /**
     * @throws Exception
     */
    public function toJson(): string
    {
        $serializedObject = $this->jsonSerialize();
        $encoded = JsonEncoder::encode($serializedObject);
        if (!$encoded) {
            throw new Exception("Could not encode type");
        }
        return $encoded;
    }

    /**
     * @return mixed[]
     * @throws \JsonException
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $reflectionClass = new \ReflectionClass($this);

        foreach ($reflectionClass->getProperties() as $property) {
            $jsonKey = self::getJsonKey($property);
            if ($jsonKey == null) {
                continue;
            }
            $value = $property->getValue($this);

            // Handle DateTime properties
            $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
            if ($dateTypeAttr && $value instanceof DateTime) {
                $dateType = $dateTypeAttr->newInstance()->type;
                $value = ($dateType === DateType::TYPE_DATE)
                    ? JsonSerializer::serializeDate($value)
                    : JsonSerializer::serializeDateTime($value);
            }

            // Handle arrays with type annotations
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if ($arrayTypeAttr && is_array($value)) {
                $arrayType = $arrayTypeAttr->newInstance()->type;
                $value = JsonSerializer::serializeArray($value, $arrayType);
            }

            if ($value !== null) {
                $result[$jsonKey] = $value;
            }
        }

        return $result;
    }

    /**
     * @throws \JsonException
     * @throws Exception
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new \JsonException("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * Deserializes an array into an object of the calling class.
     *
     * @param array<string, mixed> $data The array to deserialize.
     * @return static
     * @throws \JsonException
     */
    public static function jsonDeserialize(array $data): static
    {
        $reflectionClass = new \ReflectionClass(static::class);
        $constructor = $reflectionClass->getConstructor();
        if ($constructor == null) {
            throw new \JsonException("No constructor found.");
        }
        $parameters = $constructor->getParameters();
        $args = [];

        foreach ($parameters as $parameter) {
            $propertyName = $parameter->getName();

            if ($reflectionClass->hasProperty($propertyName)) {
                $property = $reflectionClass->getProperty($propertyName);
            } else {
                continue;
            }

            $jsonKey = self::getJsonKey($property) ?? $property->getName();
            if (array_key_exists($jsonKey, $data)) {
                $value = $data[$jsonKey];

                // Handle DateType annotation
                $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
                if ($dateTypeAttr) {
                    $dateType = $dateTypeAttr->newInstance()->type;
                    if (!is_string($value)) {
                        throw new Exception("Unexpected non-string type for date.");
                    }
                    $value = ($dateType === DateType::TYPE_DATE)
                        ? DateTime::createFromFormat(Constant::DateDeserializationFormat, $value)
                        : new DateTime($value);
                }

                // Handle ArrayType annotation
                $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
                if (is_array($value) && $arrayTypeAttr) {
                    $arrayType = $arrayTypeAttr->newInstance()->type;
                    $value = JsonDeserializer::deserializeArray($value, $arrayType);
                }

                $args[$parameter->getPosition()] = $value;
            } else {
                $args[$parameter->getPosition()] = $parameter->isDefaultValueAvailable() ? $parameter->getDefaultValue() : null;
            }
        }
        // @phpstan-ignore-next-line
        return new static(...$args);
    }

    /**
     * Helper function to retrieve the JSON key for a property.
     *
     * @param ReflectionProperty $property
     * @return ?string
     */
    private static function getJsonKey(ReflectionProperty $property): ?string
    {
        $jsonPropertyAttr = $property->getAttributes(JsonProperty::class)[0] ?? null;
        return $jsonPropertyAttr?->newInstance()?->name;
    }
}
