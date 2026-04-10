# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateFour < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateFourType }, optional: false, nullable: false
    end
  end
end
