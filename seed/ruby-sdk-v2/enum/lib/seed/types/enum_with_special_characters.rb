# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    module EnumWithSpecialCharacters
      extend Seed::Internal::Types::Enum

      BLA = "\\$bla"
      YO = "\\$yo"
    end
  end
end
