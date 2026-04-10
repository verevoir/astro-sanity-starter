.PHONY: build test lint run help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build for production
	npm run build

test: ## Lint
	$(MAKE) lint

lint: ## ESLint + Prettier check
	@echo "No linter configured (starter template)"

run: ## Start Astro dev server on port 3000
	npm run dev
