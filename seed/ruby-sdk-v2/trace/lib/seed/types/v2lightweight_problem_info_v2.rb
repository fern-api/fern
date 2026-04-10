# frozen_string_literal: true

module Seed
  module Types
    class V2LightweightProblemInfoV2 < Internal::Types::Model
      field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
      field :problem_name, -> { String }, optional: false, nullable: false, api_name: "problemName"
      field :problem_version, -> { Integer }, optional: false, nullable: false, api_name: "problemVersion"
      field :variable_types, -> { Internal::Types::Array[Seed::Types::VariableType] }, optional: false, nullable: false, api_name: "variableTypes"
    end
  end
end
