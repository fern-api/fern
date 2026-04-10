# frozen_string_literal: true

module Seed
  module Types
    class ActualResult < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::ActualResultZero }
      member -> { Seed::Types::ActualResultOne }
      member -> { Seed::Types::ActualResultTwo }
    end
  end
end
