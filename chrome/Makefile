BIN = node_modules/.bin
DUO = $(BIN)/duo

default: clean build

build: node_modules
	@mkdir -p build
	@mkdir -p build/scripts
	@cp lib/manifest.json build/manifest.json
	@cp -r lib/img build
	@cp -r lib/views build
	@cp -r lib/css build
	@$(DUO) lib/scripts/popup.js > build/scripts/popup.js
	@$(DUO) lib/scripts/background.js > build/scripts/background.js
	@$(DUO) lib/scripts/foreground.js > build/scripts/foreground.js

node_modules: package.json
	@npm install

clean:
	@rm -rf build

distclean:
	@rm -rf components node_modules

.PHONY: clean
