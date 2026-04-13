# frozen_string_literal: true

module Seed
  module Types
    module FileInfo
      extend Seed::Internal::Types::Enum

      REGULAR = "REGULAR"
      DIRECTORY = "DIRECTORY"
    end
  end
end
