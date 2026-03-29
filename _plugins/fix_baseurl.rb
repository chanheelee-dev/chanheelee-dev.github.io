# _plugins/fix_baseurl.rb
#
# Problem: jekyll-github-metadata (a transitive dependency of jekyll-theme-primer)
# hooks into :site, :after_reset and sets site.baseurl to the GitHub Actions Pages
# staging path (e.g. "/pages/chanheelee-dev"), overriding the value in _config.yml.
# This breaks jekyll-relative-links, which prepends site.baseurl to all page links.
#
# Fix: Register the same :site, :after_reset hook here and unconditionally reset
# baseurl to "". Because Bundler loads gem plugins before local _plugins/ files,
# this hook is registered last and runs last, winning over jekyll-github-metadata's
# override.
#
# Safe on local builds: site.baseurl is already "" from _config.yml, so the
# assignment is idempotent.
Jekyll::Hooks.register :site, :after_reset do |site|
  site.config["baseurl"] = ""
end
