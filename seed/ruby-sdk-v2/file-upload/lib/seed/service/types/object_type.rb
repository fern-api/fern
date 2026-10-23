# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Service
    module Types
      module ObjectType
        extend Seed::Internal::Types::Enum

        FOO = "FOO"
        BAR = "BAR"
      end
    end
  end
end
