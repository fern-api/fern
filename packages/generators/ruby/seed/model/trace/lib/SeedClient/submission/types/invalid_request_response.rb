# frozen_string_literal: true

module SeedClient
  module Submission
    class InvalidRequestResponse
      attr_reader :request, :cause, :additional_properties

      # @param request [Submission::SubmissionRequest]
      # @param cause [Submission::InvalidRequestCause]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::InvalidRequestResponse]
      def initialze(request:, cause:, additional_properties: nil)
        # @type [Submission::SubmissionRequest]
        @request = request
        # @type [Submission::InvalidRequestCause]
        @cause = cause
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of InvalidRequestResponse
      #
      # @param json_object [JSON]
      # @return [Submission::InvalidRequestResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        request = Submission::SubmissionRequest.from_json(json_object: struct.request)
        cause = Submission::InvalidRequestCause.from_json(json_object: struct.cause)
        new(request: request, cause: cause, additional_properties: struct)
      end

      # Serialize an instance of InvalidRequestResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          request: @request,
          cause: @cause
        }.to_json
      end
    end
  end
end
