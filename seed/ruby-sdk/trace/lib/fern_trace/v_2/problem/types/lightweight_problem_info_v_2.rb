# frozen_string_literal: true

require "set"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class LightweightProblemInfoV2
        # @return [String]
        attr_reader :problem_id
        # @return [String]
        attr_reader :problem_name
        # @return [Integer]
        attr_reader :problem_version
        # @return [Set<SeedTraceClient::Commons::VariableType>]
        attr_reader :variable_types
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param problem_id [String]
        # @param problem_name [String]
        # @param problem_version [Integer]
        # @param variable_types [Set<SeedTraceClient::Commons::VariableType>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::LightweightProblemInfoV2]
        def initialize(problem_id:, problem_name:, problem_version:, variable_types:, additional_properties: nil)
          @problem_id = problem_id
          @problem_name = problem_name
          @problem_version = problem_version
          @variable_types = variable_types
          @additional_properties = additional_properties
          @_field_set = {
            "problemId": problem_id,
            "problemName": problem_name,
            "problemVersion": problem_version,
            "variableTypes": variable_types
          }
        end

        # Deserialize a JSON object to an instance of LightweightProblemInfoV2
        #
        # @param json_object [String]
        # @return [SeedTraceClient::V2::Problem::LightweightProblemInfoV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          problem_id = parsed_json["problemId"]
          problem_name = parsed_json["problemName"]
          problem_version = parsed_json["problemVersion"]
          if parsed_json["variableTypes"].nil?
            variable_types = nil
          else
            variable_types = parsed_json["variableTypes"].to_json
            variable_types = Set.new(variable_types)
          end
          new(
            problem_id: problem_id,
            problem_name: problem_name,
            problem_version: problem_version,
            variable_types: variable_types,
            additional_properties: struct
          )
        end

        # Serialize an instance of LightweightProblemInfoV2 to a JSON object
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
          obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
          obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
          obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
          obj.variable_types.is_a?(Set) != false || raise("Passed value for field obj.variable_types is not the expected type, validation failed.")
        end
      end
    end
  end
end
