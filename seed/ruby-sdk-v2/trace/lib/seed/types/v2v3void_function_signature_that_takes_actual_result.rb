# frozen_string_literal: true

module Seed
  module Types
    class V2V3VoidFunctionSignatureThatTakesActualResult < Internal::Types::Model
      field :parameters, -> { Internal::Types::Array[Seed::Types::V2V3Parameter] }, optional: false, nullable: false
      field :actual_result_type, -> { Seed::Types::VariableType }, optional: false, nullable: false, api_name: "actualResultType"
    end
  end
end
