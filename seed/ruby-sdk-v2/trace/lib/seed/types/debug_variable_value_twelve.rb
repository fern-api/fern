# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueTwelve < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueTwelveType }, optional: false, nullable: false
    end
  end
end
