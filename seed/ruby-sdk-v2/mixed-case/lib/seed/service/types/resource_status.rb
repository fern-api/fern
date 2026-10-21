# frozen_string_literal: true

require_relative "../.."

module Seed
  module Service
    module Types
      module ResourceStatus
        extend Seed::Internal::Types::Enum

        ACTIVE = "ACTIVE"
        INACTIVE = "INACTIVE"
      end
    end
  end
end
