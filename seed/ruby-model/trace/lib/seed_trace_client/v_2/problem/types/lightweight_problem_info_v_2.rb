# frozen_string_literal: true

require_relative "../../../commons/types/problem_id"
require "json"
require "set"

module SeedTraceClient
  module V2
    module Problem
      class LightweightProblemInfoV2
        attr_reader :problem_id, :problem_name, :problem_version, :variable_types, :additional_properties

        # @param problem_id [Commons::PROBLEM_ID]
        # @param problem_name [String]
        # @param problem_version [Integer]
        # @param variable_types [Set<Commons::VariableType>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::LightweightProblemInfoV2]
        def initialize(problem_id:, problem_name:, problem_version:, variable_types:, additional_properties: nil)
          # @type [Commons::PROBLEM_ID]
          @problem_id = problem_id
          # @type [String]
          @problem_name = problem_name
          # @type [Integer]
          @problem_version = problem_version
          # @type [Set<Commons::VariableType>]
          @variable_types = variable_types
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of LightweightProblemInfoV2
        #
        # @param json_object [JSON]
        # @return [V2::Problem::LightweightProblemInfoV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          problem_id = struct.problemId
          problem_name = struct.problemName
          problem_version = struct.problemVersion
          variable_types = struct.variableTypes
          new(problem_id: problem_id, problem_name: problem_name, problem_version: problem_version,
              variable_types: variable_types, additional_properties: struct)
        end

        # Serialize an instance of LightweightProblemInfoV2 to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            "problemId": @problem_id,
            "problemName": @problem_name,
            "problemVersion": @problem_version,
            "variableTypes": @variable_types
          }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
          obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
          obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
          obj.variable_types.is_a?(Set) != false || raise("Passed value for field obj.variable_types is not the expected type, validation failed.")
        end
      end
    end
  end
end
