# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    module PlantBaseWateringFrequency
      extend Seed::Internal::Types::Enum

      DAILY = "daily"
      WEEKLY = "weekly"
      BIWEEKLY = "biweekly"
      MONTHLY = "monthly"
    end
  end
end
