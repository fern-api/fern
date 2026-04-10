<?php

namespace Seed;

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
     *    CreateProblemResponseSuccess
     *   |CreateProblemResponseError
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
     *    CreateProblemResponseSuccess
     *   |CreateProblemResponseError
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param CreateProblemResponseSuccess $success
     * @return CreateProblemResponse
     */
    public static function success(CreateProblemResponseSuccess $success): CreateProblemResponse
    {
        return new CreateProblemResponse([
            'type' => 'success',
            'value' => $success,
        ]);
    }

    /**
     * @param CreateProblemResponseError $error
     * @return CreateProblemResponse
     */
    public static function error(CreateProblemResponseError $error): CreateProblemResponse
    {
        return new CreateProblemResponse([
            'type' => 'error',
            'value' => $error,
        ]);
    }

    /**
     * @return bool
     */
    public function isSuccess(): bool
    {
        return $this->value instanceof CreateProblemResponseSuccess && $this->type === 'success';
    }

    /**
     * @return CreateProblemResponseSuccess
     */
    public function asSuccess(): CreateProblemResponseSuccess
    {
        if (!($this->value instanceof CreateProblemResponseSuccess && $this->type === 'success')) {
            throw new Exception(
                "Expected success; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isError(): bool
    {
        return $this->value instanceof CreateProblemResponseError && $this->type === 'error';
    }

    /**
     * @return CreateProblemResponseError
     */
    public function asError(): CreateProblemResponseError
    {
        if (!($this->value instanceof CreateProblemResponseError && $this->type === 'error')) {
            throw new Exception(
                "Expected error; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result['type'] = $this->type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case 'success':
                $value = $this->asSuccess()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'error':
                $value = $this->asError()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static
    {
        $args = [];
        if (!array_key_exists('type', $data)) {
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }

        $args['type'] = $type;
        switch ($type) {
            case 'success':
                $args['value'] = CreateProblemResponseSuccess::jsonDeserialize($data);
                break;
            case 'error':
                $args['value'] = CreateProblemResponseError::jsonDeserialize($data);
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
