# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateOne < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateOneType }, optional: false, nullable: false
    end
  end
end
