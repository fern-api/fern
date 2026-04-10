# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateNine < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateNineType }, optional: false, nullable: false
    end
  end
end
