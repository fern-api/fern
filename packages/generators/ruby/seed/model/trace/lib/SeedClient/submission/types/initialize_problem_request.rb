# frozen_string_literal: true

require_relative "commons/types/PROBLEM_ID"
require "json"

module SeedClient
  module Submission
    class InitializeProblemRequest
      attr_reader :problem_id, :problem_version, :additional_properties

      # @param problem_id [Commons::PROBLEM_ID]
      # @param problem_version [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::InitializeProblemRequest]
      def initialze(problem_id:, problem_version: nil, additional_properties: nil)
        # @type [Commons::PROBLEM_ID]
        @problem_id = problem_id
        # @type [Integer]
        @problem_version = problem_version
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of InitializeProblemRequest
      #
      # @param json_object [JSON]
      # @return [Submission::InitializeProblemRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_id = Commons::PROBLEM_ID.from_json(json_object: struct.problemId)
        problem_version = struct.problemVersion
        new(problem_id: problem_id, problem_version: problem_version, additional_properties: struct)
      end

      # Serialize an instance of InitializeProblemRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { problemId: @problem_id, problemVersion: @problem_version }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Commons::PROBLEM_ID.validate_raw(obj: obj.problem_id)
        obj.problem_version&.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
      end
    end
  end
end
