<?php

namespace Seed\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class CreateProblemResponse extends JsonSerializableType
{
    /**
     * @var (
     *    'success'
     *   |'error'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |CreateProblemError
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'success'
     *   |'error'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
     *   |CreateProblemError
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
     * @param string $success
     * @return CreateProblemResponse
     */
    public static function success(string $success): CreateProblemResponse {
        return new CreateProblemResponse([
            'type' => 'success',
            'value' => $success,
        ]);
    }

    /**
     * @param CreateProblemError $error
     * @return CreateProblemResponse
     */
    public static function error(CreateProblemError $error): CreateProblemResponse {
        return new CreateProblemResponse([
            'type' => 'error',
            'value' => $error,
        ]);
    }

    /**
     * @return bool
     */
    public function isSuccess(): bool {
        return is_string($this->value)&& $this->type === 'success';
    }

    /**
     * @return string
     */
    public function asSuccess(): string {
        if (!(is_string($this->value)&& $this->type === 'success')){
            throw new Exception(
                "Expected success; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isError(): bool {
        return $this->value instanceof CreateProblemError&& $this->type === 'error';
    }

    /**
     * @return CreateProblemError
     */
    public function asError(): CreateProblemError {
        if (!($this->value instanceof CreateProblemError&& $this->type === 'error')){
            throw new Exception(
                "Expected error; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'success':
                $value = $this->value;
                $result['success'] = $value;
                break;
            case 'error':
                $value = $this->asError()->jsonSerialize();
                $result['error'] = $value;
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
            case 'success':
                if (!array_key_exists('success', $data)){
                    throw new Exception(
                        "JSON data is missing property 'success'",
                    );
                }
                
                $args['value'] = $data['success'];
                break;
            case 'error':
                if (!array_key_exists('error', $data)){
                    throw new Exception(
                        "JSON data is missing property 'error'",
                    );
                }
                
                if (!(is_array($data['error']))){
                    throw new Exception(
                        "Expected property 'error' in JSON data to be array, instead received " . get_debug_type($data['error']),
                    );
                }
                $args['value'] = CreateProblemError::jsonDeserialize($data['error']);
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
