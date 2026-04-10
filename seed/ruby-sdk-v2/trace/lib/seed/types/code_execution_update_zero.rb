# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateZero < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateZeroType }, optional: false, nullable: false
    end
  end
end
