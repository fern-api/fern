# frozen_string_literal: true

require_relative "exception_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class InternalError
      # @return [SeedTraceClient::Submission::ExceptionInfo]
      attr_reader :exception_info
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param exception_info [SeedTraceClient::Submission::ExceptionInfo]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::InternalError]
      def initialize(exception_info:, additional_properties: nil)
        @exception_info = exception_info
        @additional_properties = additional_properties
        @_field_set = { "exceptionInfo": exception_info }
      end

      # Deserialize a JSON object to an instance of InternalError
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::InternalError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["exceptionInfo"].nil?
          exception_info = nil
        else
          exception_info = parsed_json["exceptionInfo"].to_json
          exception_info = SeedTraceClient::Submission::ExceptionInfo.from_json(json_object: exception_info)
        end
        new(exception_info: exception_info, additional_properties: struct)
      end

      # Serialize an instance of InternalError to a JSON object
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
        SeedTraceClient::Submission::ExceptionInfo.validate_raw(obj: obj.exception_info)
      end
    end
  end
end
