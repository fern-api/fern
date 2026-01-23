# frozen_string_literal: true

module FernCrossPackageTypeNames
  module FolderD
    module Service
      module Types
        class Response < Internal::Types::Model
          field :foo, -> { FernCrossPackageTypeNames::FolderB::Common::Types::Foo }, optional: true, nullable: false
        end
      end
    end
  end
end
