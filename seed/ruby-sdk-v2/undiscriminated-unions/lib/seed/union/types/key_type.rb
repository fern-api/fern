# frozen_string_literal: true

require_relative "../.."

module Seed
  module Union
    module Types
      module KeyType
        extend Seed::Internal::Types::Enum

        NAME = "name"
        VALUE = "value"
      end
    end
  end
end
