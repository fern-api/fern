/**
 * This file was auto-generated by Fern from our API Definition.
 */

import java.lang.Integer;
import java.lang.String;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import types.NestedUser;
import types.SearchRequestNeighborRequired;
import types.SearchResponse;
import types.User;

@RequestMapping(
    path = "/"
)
public interface RootService {
  @GetMapping(
      value = "/user/getUsername",
      produces = "application/json"
  )
  SearchResponse search(@RequestParam("limit") Integer limit, @RequestParam("id") String id,
      @RequestParam("date") String date, @RequestParam("deadline") OffsetDateTime deadline,
      @RequestParam("bytes") String bytes, @RequestParam("user") User user,
      @RequestParam("userList") Optional<User> userList,
      @RequestParam("optionalDeadline") Optional<OffsetDateTime> optionalDeadline,
      @RequestParam("keyValue") Optional<Map<String, Optional<String>>> keyValue,
      @RequestParam("optionalString") Optional<String> optionalString,
      @RequestParam("nestedUser") Optional<NestedUser> nestedUser,
      @RequestParam("optionalUser") Optional<User> optionalUser,
      @RequestParam("excludeUser") Optional<User> excludeUser,
      @RequestParam("filter") Optional<String> filter,
      @RequestParam("neighbor") Optional<User> neighbor,
      @RequestParam("neighborRequired") SearchRequestNeighborRequired neighborRequired);
}
