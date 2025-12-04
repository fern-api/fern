<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithDuplicativeDiscriminants extends JsonSerializableType
{
    /**
     * @var (
     *    'firstItemType'
     *   |'secondItemType'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    FirstItemType
     *   |SecondItemType
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'firstItemType'
     *   |'secondItemType'
     *   |'_unknown'
     * ),
     *   value: (
     *    FirstItemType
     *   |SecondItemType
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param FirstItemType $firstItemType
     * @return UnionWithDuplicativeDiscriminants
     */
    public static function firstItemType(FirstItemType $firstItemType): UnionWithDuplicativeDiscriminants {
        return new UnionWithDuplicativeDiscriminants([
            'type' => 'firstItemType',
            'value' => $firstItemType,
        ]);
    }

    /**
     * @param SecondItemType $secondItemType
     * @return UnionWithDuplicativeDiscriminants
     */
    public static function secondItemType(SecondItemType $secondItemType): UnionWithDuplicativeDiscriminants {
        return new UnionWithDuplicativeDiscriminants([
            'type' => 'secondItemType',
            'value' => $secondItemType,
        ]);
    }

    /**
     * @return bool
     */
    public function isFirstItemType(): bool {
        return $this->value instanceof FirstItemType&& $this->type === 'firstItemType';
    }

    /**
     * @return FirstItemType
     */
    public function asFirstItemType(): FirstItemType {
        if (!($this->value instanceof FirstItemType&& $this->type === 'firstItemType')){
            throw new Exception(
                "Expected firstItemType; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSecondItemType(): bool {
        return $this->value instanceof SecondItemType&& $this->type === 'secondItemType';
    }

    /**
     * @return SecondItemType
     */
    public function asSecondItemType(): SecondItemType {
        if (!($this->value instanceof SecondItemType&& $this->type === 'secondItemType')){
            throw new Exception(
                "Expected secondItemType; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'firstItemType':
                $value = $this->asFirstItemType()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'secondItemType':
                $value = $this->asSecondItemType()->jsonSerialize();
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
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'firstItemType':
                $args['value'] = FirstItemType::jsonDeserialize($data);
                break;
            case 'secondItemType':
                $args['value'] = SecondItemType::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
