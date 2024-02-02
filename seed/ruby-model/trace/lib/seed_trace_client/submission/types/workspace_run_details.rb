# frozen_string_literal: true

require_relative "exception_info"

require_relative "exception_v_2"
require "json"

module SeedTraceClient
  module Submission
    class WorkspaceRunDetails
      attr_reader :exception_v_2, :exception, :stdout, :additional_properties

      # @param exception_v_2 [Submission::ExceptionV2]
      # @param exception [Submission::ExceptionInfo]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceRunDetails]
      def initialize(stdout:, exception_v_2: nil, exception: nil, additional_properties: nil)
        # @type [Submission::ExceptionV2]
        @exception_v_2 = exception_v_2
        # @type [Submission::ExceptionInfo]
        @exception = exception
        # @type [String]
        @stdout = stdout
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceRunDetails
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceRunDetails]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        exception_v_2 = struct.exceptionV2
        exception = struct.exception
        stdout = struct.stdout
        new(exception_v_2: exception_v_2, exception: exception, stdout: stdout, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceRunDetails to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "exceptionV2": @exception_v_2, "exception": @exception, "stdout": @stdout }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.exception_v_2.nil? || Submission::ExceptionV2.validate_raw(obj: obj.exception_v_2)
        obj.exception.nil? || Submission::ExceptionInfo.validate_raw(obj: obj.exception)
        obj.stdout.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
