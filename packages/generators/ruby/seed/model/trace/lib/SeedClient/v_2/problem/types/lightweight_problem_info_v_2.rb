# frozen_string_literal: true
require "commons/types/ProblemId"
require "set"
require "json"
require "set"

module SeedClient
  module V2
    module Problem
      class LightweightProblemInfoV2
        attr_reader :problem_id, :problem_name, :problem_version, :variable_types, :additional_properties
        # @param problem_id [Commons::ProblemId] 
        # @param problem_name [String] 
        # @param problem_version [Integer] 
        # @param variable_types [Set<Commons::VariableType>] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::LightweightProblemInfoV2] 
        def initialze(problem_id:, problem_name:, problem_version:, variable_types:, additional_properties: nil)
          # @type [Commons::ProblemId] 
          @problem_id = problem_id
          # @type [String] 
          @problem_name = problem_name
          # @type [Integer] 
          @problem_version = problem_version
          # @type [Set<Commons::VariableType>] 
          @variable_types = variable_types
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of LightweightProblemInfoV2
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::LightweightProblemInfoV2] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          problem_id = Commons::ProblemId.from_json(json_object: struct.problemId)
          problem_name = struct.problemName
          problem_version = struct.problemVersion
          variable_types = Set.new(struct.variableTypes)
          new(problem_id: problem_id, problem_name: problem_name, problem_version: problem_version, variable_types: variable_types, additional_properties: struct)
        end
        # Serialize an instance of LightweightProblemInfoV2 to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 problemId: @problem_id,
 problemName: @problem_name,
 problemVersion: @problem_version,
 variableTypes: @variable_types.to_a()
}.to_json()
        end
      end
    end
  end
end