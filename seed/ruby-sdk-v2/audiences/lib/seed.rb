# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"

require_relative "seed/internal/json/serializable"
require_relative "seed/internal/types/type"
require_relative "seed/internal/types/utils"
require_relative "seed/internal/types/union"
require_relative "seed/internal/errors/constraint_error"
require_relative "seed/internal/errors/type_error"
require_relative "seed/internal/http/base_request"
require_relative "seed/internal/json/request"
require_relative "seed/internal/http/raw_client"
require_relative "seed/internal/multipart/multipart_encoder"
require_relative "seed/internal/multipart/multipart_form_data_part"
require_relative "seed/internal/multipart/multipart_form_data"
require_relative "seed/internal/multipart/multipart_request"
require_relative "seed/internal/types/model/field"
require_relative "seed/internal/types/model"
require_relative "seed/internal/types/array"
require_relative "seed/internal/types/boolean"
require_relative "seed/internal/types/enum"
require_relative "seed/internal/types/hash"
require_relative "seed/internal/types/unknown"
require_relative "seed/errors/api_error"
require_relative "seed/errors/response_error"
require_relative "seed/errors/client_error"
require_relative "seed/errors/redirect_error"
require_relative "seed/errors/server_error"
require_relative "seed/errors/timeout_error"
require_relative "seed/internal/iterators/item_iterator"
require_relative "seed/internal/iterators/cursor_item_iterator"
require_relative "seed/internal/iterators/offset_item_iterator"
require_relative "seed/internal/iterators/cursor_page_iterator"
require_relative "seed/internal/iterators/offset_page_iterator"
require_relative "seed/errors/connection_error"
require_relative "seed/client"
require_relative "seed/folder_a/client"
require_relative "seed/folder_a/service/client"
require_relative "seed/folder_a/service/types/get_direct_thread_request"
require_relative "seed/folder_d/client"
require_relative "seed/folder_d/service/client"
require_relative "seed/foo/client"
require_relative "seed/foo/types/find_request"
require_relative "seed/environment"

module Seed
  module Commons
    module Types
      autoload :Imported, ::File.join(__dir__, "seed/commons/types/imported")
    end
  end
end

module Seed
  module FolderC
    module Common
      module Types
        autoload :FolderCFoo, ::File.join(__dir__, "seed/folder_c/common/types/folder_c_foo")
      end
    end
  end
end

module Seed
  module FolderB
    module Common
      module Types
        autoload :Foo, ::File.join(__dir__, "seed/folder_b/common/types/foo")
      end
    end
  end
end

module Seed
  module FolderA
    module Service
      module Types
        autoload :Response, ::File.join(__dir__, "seed/folder_a/service/types/response")
      end
    end
  end
end

module Seed
  module FolderD
    module Service
      module Types
        autoload :Response, ::File.join(__dir__, "seed/folder_d/service/types/response")
      end
    end
  end
end

module Seed
  module Foo
    module Types
      autoload :ImportingType, ::File.join(__dir__, "seed/foo/types/importing_type")
      autoload :OptionalString, ::File.join(__dir__, "seed/foo/types/optional_string")
      autoload :FilteredType, ::File.join(__dir__, "seed/foo/types/filtered_type")
    end
  end
end
