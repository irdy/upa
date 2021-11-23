web: gunicorn use_push_app:app
web: cd ./use_push_app/client/use-push-app && npm install && npm run build
release: alembic upgrade head
