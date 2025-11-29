<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class InvalidRequestCause extends JsonSerializableType
{
    /**
     * @var (
     *    'submissionIdNotFound'
     *   |'customTestCasesUnsupported'
     *   |'unexpectedLanguage'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    SubmissionIdNotFound
     *   |CustomTestCasesUnsupported
     *   |UnexpectedLanguageError
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'submissionIdNotFound'
     *   |'customTestCasesUnsupported'
     *   |'unexpectedLanguage'
     *   |'_unknown'
     * ),
     *   value: (
     *    SubmissionIdNotFound
     *   |CustomTestCasesUnsupported
     *   |UnexpectedLanguageError
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
     * @param SubmissionIdNotFound $submissionIdNotFound
     * @return InvalidRequestCause
     */
    public static function submissionIdNotFound(SubmissionIdNotFound $submissionIdNotFound): InvalidRequestCause {
        return new InvalidRequestCause([
            'type' => 'submissionIdNotFound',
            'value' => $submissionIdNotFound,
        ]);
    }

    /**
     * @param CustomTestCasesUnsupported $customTestCasesUnsupported
     * @return InvalidRequestCause
     */
    public static function customTestCasesUnsupported(CustomTestCasesUnsupported $customTestCasesUnsupported): InvalidRequestCause {
        return new InvalidRequestCause([
            'type' => 'customTestCasesUnsupported',
            'value' => $customTestCasesUnsupported,
        ]);
    }

    /**
     * @param UnexpectedLanguageError $unexpectedLanguage
     * @return InvalidRequestCause
     */
    public static function unexpectedLanguage(UnexpectedLanguageError $unexpectedLanguage): InvalidRequestCause {
        return new InvalidRequestCause([
            'type' => 'unexpectedLanguage',
            'value' => $unexpectedLanguage,
        ]);
    }

    /**
     * @return bool
     */
    public function isSubmissionIdNotFound(): bool {
        return $this->value instanceof SubmissionIdNotFound&& $this->type === 'submissionIdNotFound';
    }

    /**
     * @return SubmissionIdNotFound
     */
    public function asSubmissionIdNotFound(): SubmissionIdNotFound {
        if (!($this->value instanceof SubmissionIdNotFound&& $this->type === 'submissionIdNotFound')){
            throw new Exception(
                "Expected submissionIdNotFound; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCustomTestCasesUnsupported(): bool {
        return $this->value instanceof CustomTestCasesUnsupported&& $this->type === 'customTestCasesUnsupported';
    }

    /**
     * @return CustomTestCasesUnsupported
     */
    public function asCustomTestCasesUnsupported(): CustomTestCasesUnsupported {
        if (!($this->value instanceof CustomTestCasesUnsupported&& $this->type === 'customTestCasesUnsupported')){
            throw new Exception(
                "Expected customTestCasesUnsupported; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isUnexpectedLanguage(): bool {
        return $this->value instanceof UnexpectedLanguageError&& $this->type === 'unexpectedLanguage';
    }

    /**
     * @return UnexpectedLanguageError
     */
    public function asUnexpectedLanguage(): UnexpectedLanguageError {
        if (!($this->value instanceof UnexpectedLanguageError&& $this->type === 'unexpectedLanguage')){
            throw new Exception(
                "Expected unexpectedLanguage; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'submissionIdNotFound':
                $value = $this->asSubmissionIdNotFound()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'customTestCasesUnsupported':
                $value = $this->asCustomTestCasesUnsupported()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'unexpectedLanguage':
                $value = $this->asUnexpectedLanguage()->jsonSerialize();
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
            case 'submissionIdNotFound':
                $args['value'] = SubmissionIdNotFound::jsonDeserialize($data);
                break;
            case 'customTestCasesUnsupported':
                $args['value'] = CustomTestCasesUnsupported::jsonDeserialize($data);
                break;
            case 'unexpectedLanguage':
                $args['value'] = UnexpectedLanguageError::jsonDeserialize($data);
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
