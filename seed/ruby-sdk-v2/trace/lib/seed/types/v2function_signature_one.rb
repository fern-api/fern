# frozen_string_literal: true

module Seed
  module Types
    class V2FunctionSignatureOne < Internal::Types::Model
      field :type, -> { Seed::Types::V2FunctionSignatureOneType }, optional: false, nullable: false
    end
  end
end
