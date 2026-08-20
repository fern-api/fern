# frozen_string_literal: true

module Seed
  module Types
    module WidgetStatus
      extend ::Seed::Internal::Types::Enum

      ACTIVE = "active"
      INACTIVE = "inactive"
    end
  end
end
