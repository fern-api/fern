# frozen_string_literal: true

require_relative "../.."

module Seed
  module Users
    module Types
      module Order
        extend Seed::Internal::Types::Enum

        ASC = "asc"
        DESC = "desc"
      end
    end
  end
end
