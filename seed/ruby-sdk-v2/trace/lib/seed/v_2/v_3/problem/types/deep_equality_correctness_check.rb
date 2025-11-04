# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class DeepEqualityCorrectnessCheck < Internal::Types::Model
            field :expected_value_parameter_id, lambda {
              String
            }, optional: false, nullable: false, api_name: "expectedValueParameterId"
          end
        end
      end
    end
  end
end
