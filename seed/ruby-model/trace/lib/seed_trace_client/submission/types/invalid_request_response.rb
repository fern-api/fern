# frozen_string_literal: true

require_relative "submission_request"
require_relative "invalid_request_cause"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class InvalidRequestResponse
      # @return [SeedTraceClient::Submission::SubmissionRequest]
      attr_reader :request
      # @return [SeedTraceClient::Submission::InvalidRequestCause]
      attr_reader :cause
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param request [SeedTraceClient::Submission::SubmissionRequest]
      # @param cause [SeedTraceClient::Submission::InvalidRequestCause]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::InvalidRequestResponse]
      def initialize(request:, cause:, additional_properties: nil)
        @request = request
        @cause = cause
        @additional_properties = additional_properties
        @_field_set = { "request": request, "cause": cause }
      end

      # Deserialize a JSON object to an instance of InvalidRequestResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::InvalidRequestResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["request"].nil?
          request = nil
        else
          request = parsed_json["request"].to_json
          request = SeedTraceClient::Submission::SubmissionRequest.from_json(json_object: request)
        end
        if parsed_json["cause"].nil?
          cause = nil
        else
          cause = parsed_json["cause"].to_json
          cause = SeedTraceClient::Submission::InvalidRequestCause.from_json(json_object: cause)
        end
        new(
          request: request,
          cause: cause,
          additional_properties: struct
        )
      end

      # Serialize an instance of InvalidRequestResponse to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        SeedTraceClient::Submission::SubmissionRequest.validate_raw(obj: obj.request)
        SeedTraceClient::Submission::InvalidRequestCause.validate_raw(obj: obj.cause)
      end
    end
  end
end
