# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class ProblemInfo < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false
        field :problem_description, -> { Seed::Problem::Types::ProblemDescription }, optional: false, nullable: false
        field :problem_name, -> { String }, optional: false, nullable: false
        field :problem_version, -> { Integer }, optional: false, nullable: false
        field :files, lambda {
          Internal::Types::Hash[Seed::Commons::Types::Language, Seed::Problem::Types::ProblemFiles]
        }, optional: false, nullable: false
        field :input_params, lambda {
          Internal::Types::Array[Seed::Problem::Types::VariableTypeAndName]
        }, optional: false, nullable: false
        field :output_type, -> { Seed::Commons::Types::VariableType }, optional: false, nullable: false
        field :testcases, lambda {
          Internal::Types::Array[Seed::Commons::Types::TestCaseWithExpectedResult]
        }, optional: false, nullable: false
        field :method_name, -> { String }, optional: false, nullable: false
        field :supports_custom_test_cases, -> { Internal::Types::Boolean }, optional: false, nullable: false
      end
    end
  end
end
