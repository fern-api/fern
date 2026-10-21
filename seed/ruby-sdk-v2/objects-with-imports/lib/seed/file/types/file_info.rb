# frozen_string_literal: true

require_relative "../.."

module Seed
  module File
    module Types
      module FileInfo
        extend Seed::Internal::Types::Enum

        REGULAR = "REGULAR"
        DIRECTORY = "DIRECTORY"
      end
    end
  end
end
