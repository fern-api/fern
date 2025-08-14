# frozen_string_literal: true

module Seed
    module Types
        class Response < Internal::Types::Model
            field :foo, Seed::FolderB::Common::Foo, optional: true, nullable: false

    end
end
