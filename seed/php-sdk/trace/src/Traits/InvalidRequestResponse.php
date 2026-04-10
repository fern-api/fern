<?php

namespace Seed\Traits;

use Seed\Types\SubmissionRequestZero;
use Seed\Types\SubmissionRequestType;
use Seed\Types\SubmissionRequestTwo;
use Seed\Types\SubmissionRequestThree;
use Seed\Types\SubmissionRequestFour;
use Seed\Types\InvalidRequestCauseZero;
use Seed\Types\InvalidRequestCauseOne;
use Seed\Types\InvalidRequestCauseTwo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property (
 *    SubmissionRequestZero
 *   |SubmissionRequestType
 *   |SubmissionRequestTwo
 *   |SubmissionRequestThree
 *   |SubmissionRequestFour
 * ) $request
 * @property (
 *    InvalidRequestCauseZero
 *   |InvalidRequestCauseOne
 *   |InvalidRequestCauseTwo
 * ) $cause
 */
trait InvalidRequestResponse
{
    /**
     * @var (
     *    SubmissionRequestZero
     *   |SubmissionRequestType
     *   |SubmissionRequestTwo
     *   |SubmissionRequestThree
     *   |SubmissionRequestFour
     * ) $request
     */
    #[JsonProperty('request'), Union(SubmissionRequestZero::class, SubmissionRequestType::class, SubmissionRequestTwo::class, SubmissionRequestThree::class, SubmissionRequestFour::class)]
    public SubmissionRequestZero|SubmissionRequestType|SubmissionRequestTwo|SubmissionRequestThree|SubmissionRequestFour $request;

    /**
     * @var (
     *    InvalidRequestCauseZero
     *   |InvalidRequestCauseOne
     *   |InvalidRequestCauseTwo
     * ) $cause
     */
    #[JsonProperty('cause'), Union(InvalidRequestCauseZero::class, InvalidRequestCauseOne::class, InvalidRequestCauseTwo::class)]
    public InvalidRequestCauseZero|InvalidRequestCauseOne|InvalidRequestCauseTwo $cause;
}
