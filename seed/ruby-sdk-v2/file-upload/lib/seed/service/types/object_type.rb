# frozen_string_literal: true

require_relative "../.."

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
