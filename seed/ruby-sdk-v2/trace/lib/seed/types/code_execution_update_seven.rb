# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateSeven < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateSevenType }, optional: false, nullable: false
    end
  end
end
