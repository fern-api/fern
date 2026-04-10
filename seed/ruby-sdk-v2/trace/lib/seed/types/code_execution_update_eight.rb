# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateEight < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateEightType }, optional: false, nullable: false
    end
  end
end
