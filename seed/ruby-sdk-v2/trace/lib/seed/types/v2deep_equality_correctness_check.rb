# frozen_string_literal: true

module Seed
  module Types
    class V2DeepEqualityCorrectnessCheck < Internal::Types::Model
      field :expected_value_parameter_id, -> { String }, optional: false, nullable: false, api_name: "expectedValueParameterId"
    end
  end
end
