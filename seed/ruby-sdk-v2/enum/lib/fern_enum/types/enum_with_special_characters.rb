# frozen_string_literal: true

module FernEnum
  module Types
    module EnumWithSpecialCharacters
      extend FernEnum::Internal::Types::Enum

      BLA = "\\$bla"
      YO = "\\$yo"
    end
  end
end
