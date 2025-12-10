args = backend

all: up

env:
	@if [ ! -f .env ]; then \
        echo "Creating .env from .env.example"; \
        cat .env.example >> .env; \
    else \
        echo ".env already exists."; \
    fi

up:
	docker-compose up --build -d

down:
	docker-compose down

restart:
	docker-compose restart $(args)

stop:
	docker-compose stop $(args)

rebuild:
	docker-compose up --build -d --no-deps $(args)

logs:
	docker-compose logs -f $(args)

migrations:
	docker-compose exec backend python manage.py makemigrations api

migrate:
	docker-compose exec backend python manage.py migrate

admin:
	docker-compose exec backend python manage.py createsuperuser

shell:
	docker-compose exec backend python manage.py shell

load-restaurant-types:
	docker-compose exec bot python -m scripts.load_restaurant_types

load-countries:
	docker-compose exec bot python -m scripts.load_countries

certificate:
	docker-compose run --rm certbot certonly -w /var/www/certbot --webroot -d fvbit.ru

lint:
	ruff format
	ruff check --fix
	ruff format

dev: lint restart logs
