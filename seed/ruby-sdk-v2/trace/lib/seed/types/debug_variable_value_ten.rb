# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueTen < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueTenType }, optional: false, nullable: false
    end
  end
end
