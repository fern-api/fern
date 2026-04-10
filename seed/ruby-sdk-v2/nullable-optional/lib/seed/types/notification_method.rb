# frozen_string_literal: true

module Seed
  module Types
    # Discriminated union for testing nullable unions
    class NotificationMethod < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::NotificationMethodZero }
      member -> { Seed::Types::NotificationMethodOne }
      member -> { Seed::Types::NotificationMethodTwo }
    end
  end
end
