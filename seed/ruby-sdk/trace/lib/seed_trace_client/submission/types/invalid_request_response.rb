# frozen_string_literal: true

require_relative "invalid_request_cause"

require_relative "submission_request"
require "json"

module SeedTraceClient
  module Submission
    class InvalidRequestResponse
      attr_reader :request, :cause, :additional_properties

      # @param request [Submission::SubmissionRequest]
      # @param cause [Submission::InvalidRequestCause]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::InvalidRequestResponse]
      def initialize(request:, cause:, additional_properties: nil)
        # @type [Submission::SubmissionRequest]
        @request = request
        # @type [Submission::InvalidRequestCause]
        @cause = cause
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of InvalidRequestResponse
      #
      # @param json_object [JSON]
      # @return [Submission::InvalidRequestResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        request = struct.request
        cause = struct.cause
        new(request: request, cause: cause, additional_properties: struct)
      end

      # Serialize an instance of InvalidRequestResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "request": @request, "cause": @cause }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Submission::SubmissionRequest.validate_raw(obj: obj.request)
        Submission::InvalidRequestCause.validate_raw(obj: obj.cause)
      end
    end
  end
end
