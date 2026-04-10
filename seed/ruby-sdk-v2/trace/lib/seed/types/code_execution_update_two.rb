# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateTwo < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateTwoType }, optional: false, nullable: false
    end
  end
end
