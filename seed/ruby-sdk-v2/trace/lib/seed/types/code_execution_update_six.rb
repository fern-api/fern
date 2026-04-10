# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateSix < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateSixType }, optional: false, nullable: false
    end
  end
end
