# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class DeepEqualityCorrectnessCheck < Internal::Types::Model
          field :expected_value_parameter_id, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
