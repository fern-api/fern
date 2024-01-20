# frozen_string_literal: true

module SeedClient
  module Submission
    class InternalError
      attr_reader :exception_info, :additional_properties

      # @param exception_info [Submission::ExceptionInfo]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::InternalError]
      def initialze(exception_info:, additional_properties: nil)
        # @type [Submission::ExceptionInfo]
        @exception_info = exception_info
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of InternalError
      #
      # @param json_object [JSON]
      # @return [Submission::InternalError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        exception_info = Submission::ExceptionInfo.from_json(json_object: struct.exceptionInfo)
        new(exception_info: exception_info, additional_properties: struct)
      end

      # Serialize an instance of InternalError to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          exceptionInfo: @exception_info
        }.to_json
      end
    end
  end
end
