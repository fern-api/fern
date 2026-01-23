# frozen_string_literal: true

module FernObjectsWithImports
  module File
    module Types
      module FileInfo
        extend FernObjectsWithImports::Internal::Types::Enum

        REGULAR = "REGULAR"
        DIRECTORY = "DIRECTORY"
      end
    end
  end
end
