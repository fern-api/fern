# frozen_string_literal: true

module V2
    module Types
        class DeepEqualityCorrectnessCheck < Internal::Types::Model
            field :expected_value_parameter_id, ParameterId, optional: true, nullable: true
        end
    end
end
