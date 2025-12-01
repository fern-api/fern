<?php

namespace Seed\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class CreateProblemError extends JsonSerializableType
{
    /**
     * @var (
     *    'generic'
     *   |'_unknown'
     * ) $errorType
     */
    public readonly string $errorType;

    /**
     * @var (
     *    GenericCreateProblemError
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   errorType: (
     *    'generic'
     *   |'_unknown'
     * ),
     *   value: (
     *    GenericCreateProblemError
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->errorType = $values['errorType'];$this->value = $values['value'];
    }

    /**
     * @param GenericCreateProblemError $generic
     * @return CreateProblemError
     */
    public static function generic(GenericCreateProblemError $generic): CreateProblemError {
        return new CreateProblemError([
            'errorType' => 'generic',
            'value' => $generic,
        ]);
    }

    /**
     * @return bool
     */
    public function isGeneric(): bool {
        return $this->value instanceof GenericCreateProblemError&& $this->errorType === 'generic';
    }

    /**
     * @return GenericCreateProblemError
     */
    public function asGeneric(): GenericCreateProblemError {
        if (!($this->value instanceof GenericCreateProblemError&& $this->errorType === 'generic')){
            throw new Exception(
                "Expected generic; got " . $this->errorType . " with value of type " . get_debug_type($this->value),
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
        $result['_type'] = $this->errorType;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->errorType){
            case 'generic':
                $value = $this->asGeneric()->jsonSerialize();
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
        if (!array_key_exists('_type', $data)){
            throw new Exception(
                "JSON data is missing property '_type'",
            );
        }
        $errorType = $data['_type'];
        if (!(is_string($errorType))){
            throw new Exception(
                "Expected property 'errorType' in JSON data to be string, instead received " . get_debug_type($data['_type']),
            );
        }
        
        $args['errorType'] = $errorType;
        switch ($errorType){
            case 'generic':
                $args['value'] = GenericCreateProblemError::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['errorType'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
