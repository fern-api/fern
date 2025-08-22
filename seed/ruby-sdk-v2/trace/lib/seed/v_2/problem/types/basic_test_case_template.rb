# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class BasicTestCaseTemplate < Internal::Types::Model
          field :template_id, -> { String }, optional: false, nullable: false
          field :name, -> { String }, optional: false, nullable: false
          field :description, lambda {
            Seed::V2::Problem::Types::TestCaseImplementationDescription
          }, optional: false, nullable: false
          field :expected_value_parameter_id, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
