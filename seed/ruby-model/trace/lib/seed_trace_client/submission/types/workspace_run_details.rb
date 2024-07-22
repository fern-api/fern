# frozen_string_literal: true

require_relative "exception_v_2"
require_relative "exception_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceRunDetails
      # @return [SeedTraceClient::Submission::ExceptionV2]
      attr_reader :exception_v_2
      # @return [SeedTraceClient::Submission::ExceptionInfo]
      attr_reader :exception
      # @return [String]
      attr_reader :stdout
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param exception_v_2 [SeedTraceClient::Submission::ExceptionV2]
      # @param exception [SeedTraceClient::Submission::ExceptionInfo]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::WorkspaceRunDetails]
      def initialize(stdout:, exception_v_2: OMIT, exception: OMIT, additional_properties: nil)
        @exception_v_2 = exception_v_2 if exception_v_2 != OMIT
        @exception = exception if exception != OMIT
        @stdout = stdout
        @additional_properties = additional_properties
        @_field_set = { "exceptionV2": exception_v_2, "exception": exception, "stdout": stdout }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of WorkspaceRunDetails
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceRunDetails]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["exceptionV2"].nil?
          exception_v_2 = nil
        else
          exception_v_2 = parsed_json["exceptionV2"].to_json
          exception_v_2 = SeedTraceClient::Submission::ExceptionV2.from_json(json_object: exception_v_2)
        end
        if parsed_json["exception"].nil?
          exception = nil
        else
          exception = parsed_json["exception"].to_json
          exception = SeedTraceClient::Submission::ExceptionInfo.from_json(json_object: exception)
        end
        stdout = parsed_json["stdout"]
        new(
          exception_v_2: exception_v_2,
          exception: exception,
          stdout: stdout,
          additional_properties: struct
        )
      end

      # Serialize an instance of WorkspaceRunDetails to a JSON object
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
        obj.exception_v_2.nil? || SeedTraceClient::Submission::ExceptionV2.validate_raw(obj: obj.exception_v_2)
        obj.exception.nil? || SeedTraceClient::Submission::ExceptionInfo.validate_raw(obj: obj.exception)
        obj.stdout.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
