# frozen_string_literal: true

module FernAudiences
  module FolderA
    module Service
      module Types
        class Response < Internal::Types::Model
          field :foo, -> { FernAudiences::FolderB::Common::Types::Foo }, optional: true, nullable: false
        end
      end
    end
  end
end
