# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateThree < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateThreeType }, optional: false, nullable: false
    end
  end
end
