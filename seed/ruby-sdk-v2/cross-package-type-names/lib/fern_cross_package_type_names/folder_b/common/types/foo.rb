# frozen_string_literal: true

module FernCrossPackageTypeNames
  module FolderB
    module Common
      module Types
        class Foo < Internal::Types::Model
          field :foo, -> { FernCrossPackageTypeNames::FolderC::Common::Types::Foo }, optional: true, nullable: false
        end
      end
    end
  end
end
