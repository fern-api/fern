# frozen_string_literal: true

module Seed
  module Types
    class V2FunctionSignatureTwo < Internal::Types::Model
      field :type, -> { Seed::Types::V2FunctionSignatureTwoType }, optional: false, nullable: false
    end
  end
end
