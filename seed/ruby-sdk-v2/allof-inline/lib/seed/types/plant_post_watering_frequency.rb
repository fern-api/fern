# frozen_string_literal: true

module Seed
  module Types
    module PlantPostWateringFrequency
      extend Seed::Internal::Types::Enum

      DAILY = "daily"
      WEEKLY = "weekly"
      BIWEEKLY = "biweekly"
      MONTHLY = "monthly"
    end
  end
end
