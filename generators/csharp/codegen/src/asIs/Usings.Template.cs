<% if (customConfig['embed-one-of'] === true) { %>
global using <%= rootNamespace%>.OneOf;
<% } else { %>
global using OneOf;
<% } %>