# frozen_string_literal: true

module Seed
  module Types
    class CommonsEventInfo < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::CommonsEventInfoZero }
      member -> { Seed::Types::CommonsEventInfoType }
    end
  end
end
