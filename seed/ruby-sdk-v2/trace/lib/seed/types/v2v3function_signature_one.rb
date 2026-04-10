# frozen_string_literal: true

module Seed
  module Types
    class V2V3FunctionSignatureOne < Internal::Types::Model
      field :type, -> { Seed::Types::V2V3FunctionSignatureOneType }, optional: false, nullable: false
    end
  end
end
