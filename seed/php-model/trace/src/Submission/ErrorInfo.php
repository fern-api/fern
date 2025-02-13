<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ErrorInfo extends JsonSerializableType
{
    /**
     * @var (
     *    'compileError'
     *   |'runtimeError'
     *   |'internalError'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    CompileError
     *   |RuntimeError
     *   |InternalError
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'compileError'
     *   |'runtimeError'
     *   |'internalError'
     *   |'_unknown'
     * ),
     *   value: (
     *    CompileError
     *   |RuntimeError
     *   |InternalError
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
     * @param CompileError $compileError
     * @return ErrorInfo
     */
    public static function compileError(CompileError $compileError): ErrorInfo
    {
        return new ErrorInfo([
            'type' => 'compileError',
            'value' => $compileError,
        ]);
    }

    /**
     * @param RuntimeError $runtimeError
     * @return ErrorInfo
     */
    public static function runtimeError(RuntimeError $runtimeError): ErrorInfo
    {
        return new ErrorInfo([
            'type' => 'runtimeError',
            'value' => $runtimeError,
        ]);
    }

    /**
     * @param InternalError $internalError
     * @return ErrorInfo
     */
    public static function internalError(InternalError $internalError): ErrorInfo
    {
        return new ErrorInfo([
            'type' => 'internalError',
            'value' => $internalError,
        ]);
    }

    /**
     * @return bool
     */
    public function isCompileError(): bool
    {
        return $this->value instanceof CompileError && $this->type === 'compileError';
    }

    /**
     * @return CompileError
     */
    public function asCompileError(): CompileError
    {
        if (!($this->value instanceof CompileError && $this->type === 'compileError')) {
            throw new Exception(
                "Expected compileError; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRuntimeError(): bool
    {
        return $this->value instanceof RuntimeError && $this->type === 'runtimeError';
    }

    /**
     * @return RuntimeError
     */
    public function asRuntimeError(): RuntimeError
    {
        if (!($this->value instanceof RuntimeError && $this->type === 'runtimeError')) {
            throw new Exception(
                "Expected runtimeError; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isInternalError(): bool
    {
        return $this->value instanceof InternalError && $this->type === 'internalError';
    }

    /**
     * @return InternalError
     */
    public function asInternalError(): InternalError
    {
        if (!($this->value instanceof InternalError && $this->type === 'internalError')) {
            throw new Exception(
                "Expected internalError; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'compileError':
                $value = $this->asCompileError()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'runtimeError':
                $value = $this->asRuntimeError()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'internalError':
                $value = $this->asInternalError()->jsonSerialize();
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
            case 'compileError':
                $args['value'] = CompileError::jsonDeserialize($data);
                break;
            case 'runtimeError':
                $args['value'] = RuntimeError::jsonDeserialize($data);
                break;
            case 'internalError':
                $args['value'] = InternalError::jsonDeserialize($data);
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
