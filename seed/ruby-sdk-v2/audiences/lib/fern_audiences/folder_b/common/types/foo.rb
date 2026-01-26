# frozen_string_literal: true

module FernAudiences
  module FolderB
    module Common
      module Types
        class Foo < Internal::Types::Model
          field :foo, -> { FernAudiences::FolderC::Common::Types::FolderCFoo }, optional: true, nullable: false
        end
      end
    end
  end
end
