# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateFive < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateFiveType }, optional: false, nullable: false
    end
  end
end
