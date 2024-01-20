# frozen_string_literal: true

module SeedClient
  module Submission
    class WorkspaceRunDetails
      attr_reader :exception_v_2, :exception, :stdout, :additional_properties
      # @param exception_v_2 [Submission::ExceptionV2] 
      # @param exception [Submission::ExceptionInfo] 
      # @param stdout [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceRunDetails] 
      def initialze(exception_v_2: nil, exception: nil, stdout:, additional_properties: nil)
        # @type [Submission::ExceptionV2] 
        @exception_v_2 = exception_v_2
        # @type [Submission::ExceptionInfo] 
        @exception = exception
        # @type [String] 
        @stdout = stdout
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of WorkspaceRunDetails
      #
      # @param json_object [JSON] 
      # @return [Submission::WorkspaceRunDetails] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        exception_v_2 = Submission::ExceptionV2.from_json(json_object: struct.exceptionV2)
        exception = Submission::ExceptionInfo.from_json(json_object: struct.exception)
        stdout = struct.stdout
        new(exception_v_2: exception_v_2, exception: exception, stdout: stdout, additional_properties: struct)
      end
      # Serialize an instance of WorkspaceRunDetails to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 exceptionV2: @exception_v_2,
 exception: @exception,
 stdout: @stdout
}.to_json()
      end
    end
  end
end