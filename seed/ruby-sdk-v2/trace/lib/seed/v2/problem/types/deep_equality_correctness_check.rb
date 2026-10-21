# frozen_string_literal: true

require_relative "../../../../seed"

module Seed
  module V2
    module Problem
      module Types
        class DeepEqualityCorrectnessCheck < Internal::Types::Model
          field :expected_value_parameter_id, -> { String }, optional: false, nullable: false, api_name: "expectedValueParameterId"
        end
      end
    end
  end
end
