<?php

namespace Seed\Types\Union;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class Animal extends JsonSerializableType
{
    /**
     * @var (
     *    'dog'
     *   |'cat'
     *   |'_unknown'
     * ) $animal
     */
    public readonly string $animal;

    /**
     * @var (
     *    Dog
     *   |Cat
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   animal: (
     *    'dog'
     *   |'cat'
     *   |'_unknown'
     * ),
     *   value: (
     *    Dog
     *   |Cat
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->animal = $values['animal'];$this->value = $values['value'];
    }

    /**
     * @param Dog $dog
     * @return Animal
     */
    public static function dog(Dog $dog): Animal {
        return new Animal([
            'animal' => 'dog',
            'value' => $dog,
        ]);
    }

    /**
     * @param Cat $cat
     * @return Animal
     */
    public static function cat(Cat $cat): Animal {
        return new Animal([
            'animal' => 'cat',
            'value' => $cat,
        ]);
    }

    /**
     * @return bool
     */
    public function isDog(): bool {
        return $this->value instanceof Dog&& $this->animal === 'dog';
    }

    /**
     * @return Dog
     */
    public function asDog(): Dog {
        if (!($this->value instanceof Dog&& $this->animal === 'dog')){
            throw new Exception(
                "Expected dog; got " . $this->animal . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCat(): bool {
        return $this->value instanceof Cat&& $this->animal === 'cat';
    }

    /**
     * @return Cat
     */
    public function asCat(): Cat {
        if (!($this->value instanceof Cat&& $this->animal === 'cat')){
            throw new Exception(
                "Expected cat; got " . $this->animal . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['animal'] = $this->animal;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->animal){
            case 'dog':
                $value = $this->asDog()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'cat':
                $value = $this->asCat()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('animal', $data)){
            throw new Exception(
                "JSON data is missing property 'animal'",
            );
        }
        $animal = $data['animal'];
        if (!(is_string($animal))){
            throw new Exception(
                "Expected property 'animal' in JSON data to be string, instead received " . get_debug_type($data['animal']),
            );
        }
        
        $args['animal'] = $animal;
        switch ($animal){
            case 'dog':
                $args['value'] = Dog::jsonDeserialize($data);
                break;
            case 'cat':
                $args['value'] = Cat::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['animal'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
