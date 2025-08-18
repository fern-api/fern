# frozen_string_literal: true

module Seed
    module Types
        class Foo < Internal::Types::Model
            field :foo, Seed::FolderC::Common::FolderCFoo, optional: true, nullable: false

    end
end
